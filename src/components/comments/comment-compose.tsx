"use client";

import { useRef, useState } from "react";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { ImagePlus, PenLine, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validateCommentMediaFile } from "@/lib/comments/media";
import type { CommentPostInput } from "@/types/social-comment";
import { cn } from "@/lib/utils/cn";

export function CommentCompose({
  placeholder,
  maxLength,
  posting,
  compact,
  replyTo,
  onCancelReply,
  onSubmit,
}: {
  placeholder: string;
  maxLength: number;
  posting: boolean;
  compact?: boolean;
  replyTo?: string | null;
  onCancelReply?: () => void;
  onSubmit: (input: CommentPostInput) => Promise<void>;
}) {
  const [draft, setDraft] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();

  function clearMedia() {
    setMediaFile(null);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(null);
    setMediaError(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateCommentMediaFile(file);
    if (err) {
      setMediaError(err);
      return;
    }
    setMediaError(null);
    setMediaFile(file);
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (posting) return;
    if (!draft.trim() && !mediaFile) return;
    if (!isConnected) {
      openConnectModal?.();
      return;
    }
    try {
      await onSubmit({ text: draft, mediaFile });
      setDraft("");
      clearMedia();
      onCancelReply?.();
    } catch {
      // Error surfaced by parent hook; keep draft for retry
    }
  }

  const canSubmit = (draft.trim().length > 0 || mediaFile) && !posting;

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-2">
      {replyTo && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-[#F4C542]/15 bg-[#F4C542]/5 px-2.5 py-1.5">
          <span className={cn("text-muted/70", compact ? "text-[10px]" : "text-xs")}>
            Replying to {replyTo}
          </span>
          {onCancelReply && (
            <button
              type="button"
              onClick={onCancelReply}
              className="text-muted/50 hover:text-white/80"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        rows={compact ? 2 : 3}
        maxLength={maxLength}
        disabled={posting}
        className={cn(
          "w-full resize-none border bg-[#0A1020]/70 text-white/90 outline-none transition-colors",
          compact
            ? "rounded-xl border-white/8 px-3 py-2 text-xs placeholder:text-muted/45 focus:border-[#F4C542]/25"
            : "rounded-2xl border-white/10 px-4 py-3 text-sm placeholder:text-muted/50 focus:border-[#F4C542]/30"
        )}
      />
      {mediaPreview && (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaPreview}
            alt="Upload preview"
            className={cn(
              "rounded-xl border border-white/10 object-cover",
              compact ? "max-h-28" : "max-h-40"
            )}
          />
          <button
            type="button"
            onClick={clearMedia}
            className="absolute -right-1.5 -top-1.5 rounded-full border border-white/15 bg-[#0A1020] p-0.5 text-muted/70 hover:text-white"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            disabled={posting}
            onClick={() => fileRef.current?.click()}
            className={cn(
              "inline-flex items-center gap-1 text-muted/55 transition-colors hover:text-[#F4C542]/85",
              compact ? "text-[10px]" : "text-xs"
            )}
          >
            <ImagePlus className="h-3.5 w-3.5" />
            Image / GIF
          </button>
          <span className={cn("text-muted/45", compact ? "text-[10px]" : "text-xs")}>
            {draft.length}/{maxLength}
          </span>
        </div>
        <Button
          type="submit"
          size="sm"
          variant={compact ? "outline" : "default"}
          disabled={!canSubmit}
          className={cn(compact && "h-7 border-[#F4C542]/20 px-2.5 text-[10px]")}
        >
          <PenLine className={cn("mr-1", compact ? "h-3 w-3" : "h-3.5 w-3.5")} />
          {posting ? "Signing…" : "Sign & Post"}
        </Button>
      </div>
      {mediaError && (
        <p className={cn("text-red-300/90", compact ? "text-[10px]" : "text-xs")}>
          {mediaError}
        </p>
      )}
    </form>
  );
}