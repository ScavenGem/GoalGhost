export function buildLegacySharePayload(opts: {
  ghostName: string;
  team: string;
  tokenId: number;
  memories: number;
  evolution: number;
  shareText: string;
  origin?: string;
}): { text: string; url: string } {
  const base = opts.origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  const url = `${base}/legacy?tokenId=${opts.tokenId}`;
  const text = [
    opts.shareText,
    "",
    `👻 ${opts.ghostName} · ${opts.team}`,
    `${opts.memories} evolution chapters · ${opts.evolution} evolution`,
    "",
    `Built on @0G_labs - eternal fan identity.`,
    url,
  ].join("\n");
  return { text, url };
}