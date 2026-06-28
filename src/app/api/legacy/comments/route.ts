import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createLegacyComment,
  deleteLegacyComment,
  getLegacyCommentByCommentId,
  listLegacyComments,
  updateLegacyComment,
} from "@/lib/cache/legacy-comments-cache";
import { cacheCommentMedia } from "@/lib/cache/comment-media-cache";
import { warmCommentMediaCache } from "@/lib/cache/warm-comment-media-cache";
import {
  computePublicBytesRootHash,
  uploadPublicBytesFromServer,
  uploadPublicJsonFromServer,
} from "@/lib/0g/storage/upload-public-server";
import { COMMENT_MEDIA_MAX_BYTES } from "@/lib/comments/media";
import { mimeTypeForCommentMedia } from "@/lib/comments/detect-media-type";
import { sanitizeDatabaseError } from "@/lib/db/config";
import {
  LEGACY_COMMENT_MAX_LENGTH,
  verifyLegacyCommentDeleteSignature,
  verifyLegacyCommentEditSignature,
  verifyLegacyCommentSignature,
} from "@/lib/legacy/comment-sign";
import { registerInteractionEvolution } from "@/lib/ghost/register-interaction-evolution";
import type { InteractionKind } from "@/lib/ghost/evolution";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const NO_CACHE_HEADERS = { "Cache-Control": "no-store, max-age=0" };

const walletSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/)
  .transform((value) => value.toLowerCase());

const postSchema = z
  .object({
    commentId: z.string().min(1),
    walletAddress: walletSchema,
    text: z.string().max(LEGACY_COMMENT_MAX_LENGTH).default(""),
    signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
    createdAt: z.string().datetime({ offset: true }),
    parentCommentId: z.string().optional().nullable(),
    mediaRootHash: z.string().optional().nullable(),
    mediaType: z.enum(["image", "gif"]).optional().nullable(),
    mediaBase64: z.string().max(6_000_000).optional().nullable(),
    rootHash: z.string().optional(),
  })
  .refine((d) => d.text.trim().length > 0 || !!d.mediaRootHash, {
    message: "Comment needs text or an image",
  })
  .refine((d) => !d.mediaRootHash || !!d.mediaBase64, {
    message: "Image data is required when mediaRootHash is set",
  });

const patchSchema = z.object({
  commentId: z.string().min(1),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  text: z.string().min(1).max(LEGACY_COMMENT_MAX_LENGTH),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
  updatedAt: z.string().datetime(),
});

const deleteSchema = z.object({
  commentId: z.string().min(1),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
  deletedAt: z.string().datetime(),
});

function isOwner(wallet: string, owner: string): boolean {
  return wallet.toLowerCase() === owner.toLowerCase();
}

function zodErrorMessage(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join("; ");
}

async function persistSignedLegacyMedia(body: {
  mediaRootHash?: string | null;
  mediaBase64?: string | null;
  mediaType?: string | null;
}): Promise<string | null> {
  if (!body.mediaRootHash || !body.mediaBase64) return null;

  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(Buffer.from(body.mediaBase64, "base64"));
  } catch {
    throw new Error("Invalid image encoding");
  }

  if (bytes.length === 0) {
    throw new Error("Image data is empty");
  }
  if (bytes.length > COMMENT_MEDIA_MAX_BYTES) {
    throw new Error("Image must be 4 MB or smaller");
  }

  const computedHash = await computePublicBytesRootHash(bytes);
  if (computedHash !== body.mediaRootHash) {
    throw new Error("Image hash does not match signed mediaRootHash");
  }

  await cacheCommentMedia({
    rootHash: body.mediaRootHash,
    bytes,
    mimeType: mimeTypeForCommentMedia(body.mediaType),
  });

  const uploaded = await uploadPublicBytesFromServer(bytes);
  if (uploaded.rootHash !== body.mediaRootHash) {
    throw new Error("Image upload hash mismatch");
  }

  return uploaded.rootHash;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get("wallet")?.toLowerCase() ?? undefined;
    const comments = await listLegacyComments(wallet);
    return NextResponse.json(
      { comments, fetchedAt: new Date().toISOString() },
      { headers: NO_CACHE_HEADERS }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to load comments";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = postSchema.parse(await req.json());

    if (body.parentCommentId) {
      const parent = await getLegacyCommentByCommentId(body.parentCommentId);
      if (!parent) {
        return NextResponse.json({ error: "Invalid reply target" }, { status: 400 });
      }
    }

    const valid = await verifyLegacyCommentSignature({
      address: body.walletAddress,
      text: body.text,
      createdAt: body.createdAt,
      signature: body.signature,
      parentCommentId: body.parentCommentId,
      mediaRootHash: body.mediaRootHash,
    });

    if (!valid) {
      return NextResponse.json({ error: "Invalid wallet signature" }, { status: 401 });
    }

    await persistSignedLegacyMedia(body);

    const document = {
      version: 2,
      type: "legacy_comment",
      commentId: body.commentId,
      parentCommentId: body.parentCommentId ?? null,
      walletAddress: body.walletAddress.toLowerCase(),
      text: body.text.trim(),
      signature: body.signature,
      mediaRootHash: body.mediaRootHash ?? null,
      mediaType: body.mediaType ?? null,
      createdAt: body.createdAt,
    };

    const { rootHash } = await uploadPublicJsonFromServer(document);

    const comment = await createLegacyComment({
      commentId: body.commentId,
      parentCommentId: body.parentCommentId ?? null,
      walletAddress: body.walletAddress,
      text: body.text.trim(),
      signature: body.signature,
      rootHash,
      mediaRootHash: body.mediaRootHash ?? null,
      mediaType: body.mediaType ?? null,
      createdAt: new Date(body.createdAt),
    });

    await warmCommentMediaCache({
      mediaRootHash: body.mediaRootHash,
      mediaType: body.mediaType,
    });

    const withReactions = await getLegacyCommentByCommentId(
      comment.commentId,
      body.walletAddress
    );

    const kind: InteractionKind = body.mediaRootHash
      ? "legacy_comment_media"
      : body.parentCommentId
        ? "legacy_comment_reply"
        : "legacy_comment";

    const evolution = await registerInteractionEvolution({
      walletAddress: body.walletAddress,
      kind,
      eventId: `evolution-${body.commentId}`,
      rootHash,
      occurredAt: body.createdAt,
      text: body.text,
      scope: "legacy",
      isReply: !!body.parentCommentId,
      hasMedia: !!body.mediaRootHash,
      mediaType: body.mediaType,
    });

    return NextResponse.json({
      ok: true,
      comment: withReactions ?? comment,
      evolution,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { error: `Invalid comment payload: ${zodErrorMessage(e)}` },
        { status: 400 }
      );
    }
    const msg = sanitizeDatabaseError(e);
    const status =
      msg.includes("already posted") || msg.includes("Unique constraint")
        ? 409
        : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = patchSchema.parse(await req.json());
    const existing = await getLegacyCommentByCommentId(body.commentId);

    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (!isOwner(body.walletAddress, existing.walletAddress)) {
      return NextResponse.json({ error: "Not your comment" }, { status: 403 });
    }

    const valid = await verifyLegacyCommentEditSignature({
      address: body.walletAddress,
      commentId: body.commentId,
      text: body.text,
      updatedAt: body.updatedAt,
      signature: body.signature,
    });

    if (!valid) {
      return NextResponse.json({ error: "Invalid wallet signature" }, { status: 401 });
    }

    const document = {
      version: 1,
      type: "legacy_comment",
      commentId: body.commentId,
      walletAddress: body.walletAddress.toLowerCase(),
      text: body.text.trim(),
      signature: body.signature,
      createdAt: existing.createdAt,
      updatedAt: body.updatedAt,
    };

    const { rootHash } = await uploadPublicJsonFromServer(document);
    const comment = await updateLegacyComment({
      commentId: body.commentId,
      text: body.text.trim(),
      signature: body.signature,
      rootHash,
      updatedAt: new Date(body.updatedAt),
    });

    if (!comment) {
      return NextResponse.json({ error: "Failed to update comment" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, comment });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid edit payload" }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "Failed to edit comment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = deleteSchema.parse(await req.json());
    const existing = await getLegacyCommentByCommentId(body.commentId);

    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (!isOwner(body.walletAddress, existing.walletAddress)) {
      return NextResponse.json({ error: "Not your comment" }, { status: 403 });
    }

    const valid = await verifyLegacyCommentDeleteSignature({
      address: body.walletAddress,
      commentId: body.commentId,
      deletedAt: body.deletedAt,
      signature: body.signature,
    });

    if (!valid) {
      return NextResponse.json({ error: "Invalid wallet signature" }, { status: 401 });
    }

    const deleted = await deleteLegacyComment(body.commentId);
    if (!deleted) {
      return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid delete payload" }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "Failed to delete comment";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}