import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createNewsComment,
  deleteNewsComment,
  getNewsCommentByCommentId,
  listNewsComments,
  updateNewsComment,
} from "@/lib/cache/news-comments-cache";
import { uploadPublicJsonFromServer } from "@/lib/0g/storage/upload-public-server";
import {
  NEWS_COMMENT_MAX_LENGTH,
  verifyNewsCommentDeleteSignature,
  verifyNewsCommentEditSignature,
  verifyNewsCommentSignature,
} from "@/lib/news/comment-sign";

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
    articleId: z.string().min(1),
    walletAddress: walletSchema,
    text: z.string().max(NEWS_COMMENT_MAX_LENGTH).default(""),
    signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
    createdAt: z.string().datetime({ offset: true }),
    parentCommentId: z.string().optional().nullable(),
    mediaRootHash: z.string().optional().nullable(),
    mediaType: z.enum(["image", "gif"]).optional().nullable(),
  })
  .refine((d) => d.text.trim().length > 0 || !!d.mediaRootHash, {
    message: "Comment needs text or an image",
  });

const patchSchema = z.object({
  commentId: z.string().min(1),
  articleId: z.string().min(1),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  text: z.string().min(1).max(NEWS_COMMENT_MAX_LENGTH),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
  updatedAt: z.string().datetime(),
});

const deleteSchema = z.object({
  commentId: z.string().min(1),
  articleId: z.string().min(1),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
  deletedAt: z.string().datetime(),
});

function isOwner(wallet: string, owner: string): boolean {
  return wallet.toLowerCase() === owner.toLowerCase();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("articleIds") ?? "";
    const articleIds = raw
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    const wallet = searchParams.get("wallet")?.toLowerCase() ?? undefined;
    const comments = await listNewsComments(articleIds, wallet);
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
      const parent = await getNewsCommentByCommentId(body.parentCommentId);
      if (!parent || parent.articleId !== body.articleId) {
        return NextResponse.json({ error: "Invalid reply target" }, { status: 400 });
      }
    }

    const valid = await verifyNewsCommentSignature({
      address: body.walletAddress,
      articleId: body.articleId,
      text: body.text,
      createdAt: body.createdAt,
      signature: body.signature,
      parentCommentId: body.parentCommentId,
      mediaRootHash: body.mediaRootHash,
    });

    if (!valid) {
      return NextResponse.json({ error: "Invalid wallet signature" }, { status: 401 });
    }

    const document = {
      version: 2,
      type: "news_comment",
      commentId: body.commentId,
      articleId: body.articleId,
      parentCommentId: body.parentCommentId ?? null,
      walletAddress: body.walletAddress.toLowerCase(),
      text: body.text.trim(),
      signature: body.signature,
      mediaRootHash: body.mediaRootHash ?? null,
      mediaType: body.mediaType ?? null,
      createdAt: body.createdAt,
    };

    const { rootHash } = await uploadPublicJsonFromServer(document);
    const comment = await createNewsComment({
      commentId: body.commentId,
      articleId: body.articleId,
      parentCommentId: body.parentCommentId ?? null,
      walletAddress: body.walletAddress,
      text: body.text.trim(),
      signature: body.signature,
      rootHash,
      mediaRootHash: body.mediaRootHash ?? null,
      mediaType: body.mediaType ?? null,
      createdAt: new Date(body.createdAt),
    });

    const withReactions = await getNewsCommentByCommentId(
      comment.commentId,
      body.walletAddress
    );

    return NextResponse.json({ ok: true, comment: withReactions ?? comment });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid comment payload" }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "Failed to post comment";
    const status = msg.includes("Unique constraint") ? 409 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = patchSchema.parse(await req.json());
    const existing = await getNewsCommentByCommentId(body.commentId);

    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (!isOwner(body.walletAddress, existing.walletAddress)) {
      return NextResponse.json({ error: "Not your comment" }, { status: 403 });
    }

    if (existing.articleId !== body.articleId) {
      return NextResponse.json({ error: "Article mismatch" }, { status: 400 });
    }

    const valid = await verifyNewsCommentEditSignature({
      address: body.walletAddress,
      commentId: body.commentId,
      articleId: body.articleId,
      text: body.text,
      updatedAt: body.updatedAt,
      signature: body.signature,
    });

    if (!valid) {
      return NextResponse.json({ error: "Invalid wallet signature" }, { status: 401 });
    }

    const document = {
      version: 1,
      type: "news_comment",
      commentId: body.commentId,
      articleId: body.articleId,
      walletAddress: body.walletAddress.toLowerCase(),
      text: body.text.trim(),
      signature: body.signature,
      createdAt: existing.createdAt,
      updatedAt: body.updatedAt,
    };

    const { rootHash } = await uploadPublicJsonFromServer(document);
    const comment = await updateNewsComment({
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
    const existing = await getNewsCommentByCommentId(body.commentId);

    if (!existing) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (!isOwner(body.walletAddress, existing.walletAddress)) {
      return NextResponse.json({ error: "Not your comment" }, { status: 403 });
    }

    if (existing.articleId !== body.articleId) {
      return NextResponse.json({ error: "Article mismatch" }, { status: 400 });
    }

    const valid = await verifyNewsCommentDeleteSignature({
      address: body.walletAddress,
      commentId: body.commentId,
      articleId: body.articleId,
      deletedAt: body.deletedAt,
      signature: body.signature,
    });

    if (!valid) {
      return NextResponse.json({ error: "Invalid wallet signature" }, { status: 401 });
    }

    const deleted = await deleteNewsComment(body.commentId);
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