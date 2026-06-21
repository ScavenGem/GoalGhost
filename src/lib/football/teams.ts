/** Official 2026 FIFA World Cup participating nations (48 teams), alphabetical by name */
export const WC_2026_NATIONS = [
  { code: "ALG", name: "Algeria", flag: "🇩🇿" },
  { code: "ARG", name: "Argentina", flag: "🇦🇷" },
  { code: "AUS", name: "Australia", flag: "🇦🇺" },
  { code: "AUT", name: "Austria", flag: "🇦🇹" },
  { code: "BEL", name: "Belgium", flag: "🇧🇪" },
  { code: "BIH", name: "Bosnia-Herzegovina", flag: "🇧🇦" },
  { code: "BRA", name: "Brazil", flag: "🇧🇷" },
  { code: "CAN", name: "Canada", flag: "🇨🇦" },
  { code: "CPV", name: "Cape Verde", flag: "🇨🇻" },
  { code: "COL", name: "Colombia", flag: "🇨🇴" },
  { code: "COD", name: "Congo DR", flag: "🇨🇩" },
  { code: "CRO", name: "Croatia", flag: "🇭🇷" },
  { code: "CUW", name: "Curaçao", flag: "🇨🇼" },
  { code: "CZE", name: "Czechia", flag: "🇨🇿" },
  { code: "ECU", name: "Ecuador", flag: "🇪🇨" },
  { code: "EGY", name: "Egypt", flag: "🇪🇬" },
  { code: "ENG", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code: "FRA", name: "France", flag: "🇫🇷" },
  { code: "GER", name: "Germany", flag: "🇩🇪" },
  { code: "GHA", name: "Ghana", flag: "🇬🇭" },
  { code: "HAI", name: "Haiti", flag: "🇭🇹" },
  { code: "IRN", name: "Iran", flag: "🇮🇷" },
  { code: "IRQ", name: "Iraq", flag: "🇮🇶" },
  { code: "CIV", name: "Ivory Coast", flag: "🇨🇮" },
  { code: "JPN", name: "Japan", flag: "🇯🇵" },
  { code: "JOR", name: "Jordan", flag: "🇯🇴" },
  { code: "MEX", name: "Mexico", flag: "🇲🇽" },
  { code: "MAR", name: "Morocco", flag: "🇲🇦" },
  { code: "NED", name: "Netherlands", flag: "🇳🇱" },
  { code: "NZL", name: "New Zealand", flag: "🇳🇿" },
  { code: "NOR", name: "Norway", flag: "🇳🇴" },
  { code: "PAN", name: "Panama", flag: "🇵🇦" },
  { code: "PAR", name: "Paraguay", flag: "🇵🇾" },
  { code: "POR", name: "Portugal", flag: "🇵🇹" },
  { code: "QAT", name: "Qatar", flag: "🇶🇦" },
  { code: "KSA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "SCO", name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  { code: "SEN", name: "Senegal", flag: "🇸🇳" },
  { code: "RSA", name: "South Africa", flag: "🇿🇦" },
  { code: "KOR", name: "South Korea", flag: "🇰🇷" },
  { code: "ESP", name: "Spain", flag: "🇪🇸" },
  { code: "SWE", name: "Sweden", flag: "🇸🇪" },
  { code: "SUI", name: "Switzerland", flag: "🇨🇭" },
  { code: "TUN", name: "Tunisia", flag: "🇹🇳" },
  { code: "TUR", name: "Turkey", flag: "🇹🇷" },
  { code: "USA", name: "United States", flag: "🇺🇸" },
  { code: "URU", name: "Uruguay", flag: "🇺🇾" },
  { code: "UZB", name: "Uzbekistan", flag: "🇺🇿" },
] as const;

export type WcNation = (typeof WC_2026_NATIONS)[number];

/** @deprecated Use WC_2026_NATIONS for nation selection */
export const MAJOR_NATIONS = WC_2026_NATIONS.filter((n) =>
  [
    "BRA", "ARG", "FRA", "GER", "ESP", "ENG", "POR", "NED", "USA", "MEX", "JPN", "NGA", "MAR",
  ].includes(n.code)
);

export function teamNameFromCode(code: string): string {
  return WC_2026_NATIONS.find((t) => t.code === code)?.name ?? code;
}

export function nationByName(name: string): WcNation | undefined {
  return WC_2026_NATIONS.find((t) => t.name === name);
}