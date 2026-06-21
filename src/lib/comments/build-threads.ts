export type ThreadedComment<T extends { commentId: string; parentCommentId?: string | null; createdAt: string }> = T & {
  replies: ThreadedComment<T>[];
};

export function buildCommentThreads<
  T extends { commentId: string; parentCommentId?: string | null; createdAt: string },
>(comments: T[]): ThreadedComment<T>[] {
  const byId = new Map<string, ThreadedComment<T>>();
  const roots: ThreadedComment<T>[] = [];

  for (const comment of comments) {
    byId.set(comment.commentId, { ...comment, replies: [] });
  }

  for (const node of byId.values()) {
    const parentId = node.parentCommentId;
    if (parentId && byId.has(parentId)) {
      byId.get(parentId)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortAsc = (a: ThreadedComment<T>, b: ThreadedComment<T>) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();

  function sortTree(nodes: ThreadedComment<T>[]) {
    nodes.sort(sortAsc);
    for (const node of nodes) sortTree(node.replies);
  }

  roots.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  for (const root of roots) sortTree(root.replies);
  return roots;
}