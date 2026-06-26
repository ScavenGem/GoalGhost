"use client";

import { useId, useMemo, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { hoverLinkSubtle } from "@/lib/utils/hover";

const DEFAULT_MAX_CHARS = 180;

export function shouldTruncateText(
  text: string,
  maxChars: number = DEFAULT_MAX_CHARS
): boolean {
  return text.trim().length > maxChars;
}

export function ReadMoreText({
  children,
  className,
  maxChars = DEFAULT_MAX_CHARS,
  collapsedLines = 4,
  readMoreLabel = "Read More",
  readLessLabel = "Read Less",
  onToggle,
}: {
  children: string;
  className?: string;
  maxChars?: number;
  collapsedLines?: 3 | 4;
  readMoreLabel?: string;
  readLessLabel?: string;
  onToggle?: (expanded: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const contentId = useId();
  const needsTruncation = useMemo(
    () => shouldTruncateText(children, maxChars),
    [children, maxChars]
  );

  function toggle() {
    setExpanded((prev) => {
      const next = !prev;
      onToggle?.(next);
      return next;
    });
  }

  if (!needsTruncation) {
    return <p className={className}>{children}</p>;
  }

  const lineClampClass = collapsedLines === 3 ? "line-clamp-3" : "line-clamp-4";

  return (
    <div>
      <p
        id={contentId}
        className={cn(className, !expanded && lineClampClass)}
      >
        {children}
      </p>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggle();
        }}
        aria-expanded={expanded}
        aria-controls={contentId}
        className={cn(
          "mt-2 inline-flex text-sm font-medium text-[#F4C542]/85",
          hoverLinkSubtle
        )}
      >
        {expanded ? readLessLabel : readMoreLabel}
      </button>
    </div>
  );
}