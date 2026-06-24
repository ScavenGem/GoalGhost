/** Stable news article id — the canonical article URL (no feed index suffix). */
export function stableNewsArticleId(url: string): string {
  return url.trim();
}

/**
 * Map a stored comment articleId onto a currently displayed article id.
 * Supports legacy ids of the form `${url}-${index}` from older feeds.
 */
export function resolveCommentArticleId(
  storedArticleId: string,
  knownArticleIds: readonly string[]
): string {
  const stored = storedArticleId.trim();
  if (knownArticleIds.includes(stored)) return stored;

  for (const id of knownArticleIds) {
    if (stored.startsWith(`${id}-`)) return id;
  }

  const legacy = stored.match(/^(https?:\/\/.+)-(\d+)$/);
  if (legacy && knownArticleIds.includes(legacy[1])) {
    return legacy[1];
  }

  return stored;
}

/** Prisma OR conditions so comments persist across legacy article id formats. */
export function newsCommentArticleIdWhere(
  articleIds: readonly string[]
): { OR: Array<{ articleId: string } | { articleId: { startsWith: string } }> } {
  const seen = new Set<string>();
  const OR: Array<{ articleId: string } | { articleId: { startsWith: string } }> = [];

  for (const raw of articleIds) {
    const id = raw.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);

    OR.push({ articleId: id });
    OR.push({ articleId: { startsWith: `${id}-` } });

    const legacy = id.match(/^(https?:\/\/.+)-(\d+)$/);
    if (legacy) {
      const base = legacy[1];
      if (!seen.has(base)) {
        seen.add(base);
        OR.push({ articleId: base });
        OR.push({ articleId: { startsWith: `${base}-` } });
      }
    }
  }

  return { OR };
}