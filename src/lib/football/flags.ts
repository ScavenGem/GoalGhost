import { WC_2026_NATIONS } from "./teams";

/** API / feed name aliases → canonical WC nation name */
const NAME_ALIASES: Record<string, string> = {
  "Bosnia-Herzegovina": "Bosnia-Herzegovina",
  "Congo DR": "Congo DR",
  "Cape Verde Islands": "Cape Verde",
  Curacao: "Curaçao",
  "Côte d'Ivoire": "Ivory Coast",
  "Korea Republic": "South Korea",
  "Czech Republic": "Czechia",
  Chile: "Chile",
  Cameroon: "Cameroon",
  Honduras: "Honduras",
  Iraq: "Iraq",
  Italy: "Italy",
  Jamaica: "Jamaica",
  Jordan: "Jordan",
  Peru: "Peru",
  Poland: "Poland",
  Venezuela: "Venezuela",
  Wales: "Wales",
};

const FLAG_BY_NAME = new Map<string, string>(
  WC_2026_NATIONS.map((n) => [n.name, n.flag] as const)
);

const FLAG_BY_CODE = new Map<string, string>(
  WC_2026_NATIONS.map((n) => [n.code, n.flag] as const)
);

// Extra nations / aliases not in WC_2026_NATIONS but seen in match feeds
const EXTRA_FLAGS: Record<string, string> = {
  Chile: "🇨🇱",
  Cameroon: "🇨🇲",
  Honduras: "🇭🇳",
  Iraq: "🇮🇶",
  Italy: "🇮🇹",
  Jamaica: "🇯🇲",
  Jordan: "🇯🇴",
  Peru: "🇵🇪",
  Poland: "🇵🇱",
  Venezuela: "🇻🇪",
  Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  "Cape Verde Islands": "🇨🇻",
  Curacao: "🇨🇼",
  "Costa Rica": "🇨🇷",
  "Côte d'Ivoire": "🇨🇮",
  "Korea Republic": "🇰🇷",
};

for (const [name, flag] of Object.entries(EXTRA_FLAGS)) {
  FLAG_BY_NAME.set(name, flag);
}

const EXTRA_CODES: Record<string, string> = {
  CHI: "🇨🇱",
  CMR: "🇨🇲",
  HON: "🇭🇳",
  IRQ: "🇮🇶",
  ITA: "🇮🇹",
  JAM: "🇯🇲",
  JOR: "🇯🇴",
  PER: "🇵🇪",
  POL: "🇵🇱",
  VEN: "🇻🇪",
  WAL: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  CRC: "🇨🇷",
};

for (const [code, flag] of Object.entries(EXTRA_CODES)) {
  FLAG_BY_CODE.set(code, flag);
}

function resolveCanonicalName(teamName: string): string {
  return NAME_ALIASES[teamName] ?? teamName;
}

/** Resolve a national flag emoji — same lookup used by Match Center and homepage. */
export function teamFlagEmoji(team: string, code?: string): string {
  if (code) {
    const byCode = FLAG_BY_CODE.get(code.toUpperCase());
    if (byCode) return byCode;
  }

  const canonical = resolveCanonicalName(team);
  const byName = FLAG_BY_NAME.get(canonical);
  if (byName) return byName;

  const direct = FLAG_BY_NAME.get(team);
  if (direct) return direct;

  const fromNation = WC_2026_NATIONS.find(
    (n) =>
      n.code === code?.toUpperCase() ||
      n.name.toLowerCase() === team.toLowerCase() ||
      n.name.toLowerCase() === canonical.toLowerCase()
  );
  if (fromNation) return fromNation.flag;

  const normalized = team.toLowerCase();
  for (const [name, flag] of FLAG_BY_NAME) {
    if (normalized === name.toLowerCase()) return flag;
    if (normalized.includes(name.toLowerCase())) return flag;
  }

  return "🏳️";
}

/** Twemoji CDN URL for consistent flag rendering across platforms. */
export function twemojiFlagSrc(emoji: string): string {
  const codePoints = Array.from(emoji)
    .map((char) => char.codePointAt(0))
    .filter((cp): cp is number => cp !== undefined)
    .map((cp) => cp.toString(16))
    .join("-");
  return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${codePoints}.png`;
}

/** @deprecated Use teamFlagEmoji */
export function flagForTeam(teamName: string, teamCode?: string): string {
  return teamFlagEmoji(teamName, teamCode);
}