"use client";

import { useState } from "react";
import { commentMediaUrl } from "@/lib/comments/media";
import type { CommentMediaType } from "@/types/social-comment";
import { cn } from "@/lib/utils/cn";

export function CommentAttachment({
  mediaRootHash,
  mediaType,
  mediaUrl,
  variant = "compact",
}: {
  mediaRootHash: string;
  mediaType?: CommentMediaType | null;
  mediaUrl?: string | null;
  variant?: "compact" | "full";
}) {
  const [failed, setFailed] = useState(false);
  const src = mediaUrl ?? commentMediaUrl(mediaRootHash, mediaType);

  if (failed) {
    return (
      <p
        className={cn(
          "text-muted/55",
          variant === "compact" ? "text-[10px]" : "text-xs"
        )}
      >
        Image could not be loaded.
      </p>
    );
  }

  return (
    <div className="mt-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={cn(
          "max-w-full rounded-xl border border-white/10 bg-[#0A1020]/40 object-contain",
          variant === "compact" ? "max-h-36" : "max-h-52"
        )}
      />
    </div>
  );
}