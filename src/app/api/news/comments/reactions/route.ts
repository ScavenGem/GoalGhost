import { NextResponse } from "next/server";
import { z } from "zod";
import {
  getCommentReactionsForComments,
  removeCommentReaction,
  upsertCommentReaction,
} from "@/lib/cache/comment-reactions-cache";
import { getNewsCommentByCommentId } from "@/lib/cache/news-comments-cache";
import { verifyCommentReactionSignature } from "@/lib/comments/reaction-sign";
import { registerInteractionEvolution } from "@/lib/ghost/register-interaction-evolution";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const postSchema = z.object({
  commentId: z.string().min(1),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  emojiId: z.enum(["fire", "heart", "football", "sad", "celebration"]),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
  createdAt: z.string().datetime(),
});

export async function POST(req: Request) {
  try {
    const body = postSchema.parse(await req.json());
    const comment = await getNewsCommentByCommentId(body.commentId);
    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const valid = await verifyCommentReactionSignature({
      scope: "news",
      commentId: body.commentId,
      emojiId: body.emojiId,
      address: body.walletAddress,
      createdAt: body.createdAt,
      signature: body.signature,
    });

    if (!valid) {
      return NextResponse.json({ error: "Invalid wallet signature" }, { status: 401 });
    }

    const existing = await getCommentReactionsForComments(
      "news",
      [body.commentId],
      body.walletAddress
    );
    const current = existing[body.commentId];

    let evolution = null;

    if (current?.userReaction === body.emojiId) {
      await removeCommentReaction({
        scope: "news",
        commentId: body.commentId,
        walletAddress: body.walletAddress,
      });
    } else {
      await upsertCommentReaction({
        scope: "news",
        commentId: body.commentId,
        walletAddress: body.walletAddress,
        emojiId: body.emojiId,
        signature: body.signature,
        createdAt: new Date(body.createdAt),
      });

      evolution = await registerInteractionEvolution({
        walletAddress: body.walletAddress,
        kind: "comment_emoji_reaction",
        eventId: `evolution-reaction-news-${body.commentId}-${body.walletAddress.toLowerCase()}`,
        rootHash: comment.rootHash,
        occurredAt: body.createdAt,
        scope: "news",
        emojiId: body.emojiId,
      });
    }

    const reactions = await getCommentReactionsForComments(
      "news",
      [body.commentId],
      body.walletAddress
    );

    return NextResponse.json({
      ok: true,
      commentId: body.commentId,
      reactions: reactions[body.commentId],
      evolution,
    });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid reaction payload" }, { status: 400 });
    }
    const msg = e instanceof Error ? e.message : "Failed to react";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}