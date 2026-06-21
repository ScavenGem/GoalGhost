import { MAJOR_NATIONS } from "./teams";

const EXTRA_FLAGS: Record<string, string> = {
  Morocco: "🇲🇦",
  Croatia: "🇭🇷",
  Belgium: "🇧🇪",
  Uruguay: "🇺🇾",
  Colombia: "🇨🇴",
  "South Korea": "🇰🇷",
  "Korea Republic": "🇰🇷",
  Senegal: "🇸🇳",
  Cameroon: "🇨🇲",
  Ghana: "🇬🇭",
  Switzerland: "🇨🇭",
  Poland: "🇵🇱",
  Serbia: "🇷🇸",
  Wales: "🏴󠁧󠁢󠁷󠁬󠁳󠁿",
  Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Canada: "🇨🇦",
  Australia: "🇦🇺",
  Ecuador: "🇪🇨",
  "Costa Rica": "🇨🇷",
  Tunisia: "🇹🇳",
  Iran: "🇮🇷",
  "Saudi Arabia": "🇸🇦",
  Qatar: "🇶🇦",
};

const FLAG_BY_NAME = new Map<string, string>([
  ...MAJOR_NATIONS.map((n) => [n.name, n.flag] as const),
  ...Object.entries(EXTRA_FLAGS),
]);

const FLAG_BY_CODE = new Map<string, string>([
  ...MAJOR_NATIONS.map((n) => [n.code, n.flag] as const),
  ["CRO", "🇭🇷"],
  ["BEL", "🇧🇪"],
]);

/** Emoji fallback for non-UI contexts; prefer NationalFlag in match cards. */
export function flagForTeam(teamName: string, teamCode?: string): string {
  if (teamCode) {
    const byCode = FLAG_BY_CODE.get(teamCode.toUpperCase());
    if (byCode) return byCode;
  }

  const direct = FLAG_BY_NAME.get(teamName);
  if (direct) return direct;

  const byCode = MAJOR_NATIONS.find(
    (n) =>
      n.code === teamName.toUpperCase() ||
      n.name.toLowerCase() === teamName.toLowerCase()
  );
  if (byCode) return byCode.flag;

  for (const [name, flag] of FLAG_BY_NAME) {
    if (teamName.toLowerCase().includes(name.toLowerCase())) return flag;
  }

  return "⚽";
}