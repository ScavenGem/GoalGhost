import { MAJOR_NATIONS } from "./teams";

/** FIFA TLA / API codes → flagcdn.com ISO slug */
const TLA_TO_ISO: Record<string, string> = {
  BRA: "br",
  ARG: "ar",
  FRA: "fr",
  GER: "de",
  ESP: "es",
  ENG: "gb-eng",
  POR: "pt",
  NED: "nl",
  NET: "nl",
  ITA: "it",
  USA: "us",
  MEX: "mx",
  JPN: "jp",
  NGA: "ng",
  MAR: "ma",
  MOR: "ma",
  CRO: "hr",
  BEL: "be",
  KOR: "kr",
  CRC: "cr",
  URU: "uy",
  COL: "co",
  SEN: "sn",
  CMR: "cm",
  GHA: "gh",
  SUI: "ch",
  POL: "pl",
  SRB: "rs",
  CAN: "ca",
  AUS: "au",
  ECU: "ec",
  TUN: "tn",
  IRN: "ir",
  KSA: "sa",
  QAT: "qa",
  WAL: "gb-wls",
  SCO: "gb-sct",
  DEN: "dk",
  SWE: "se",
  NOR: "no",
  AUT: "at",
  CZE: "cz",
  UKR: "ua",
  RUS: "ru",
  TUR: "tr",
  EGY: "eg",
  ALG: "dz",
  CHI: "cl",
  PER: "pe",
  PAR: "py",
  BOL: "bo",
  VEN: "ve",
  PAN: "pa",
  JAM: "jm",
  HON: "hn",
  NZL: "nz",
  RSA: "za",
  CIV: "ci",
  CM: "cm",
  MX: "mx",
  KR: "kr",
  US: "us",
  GB: "gb-eng",
};

const NAME_TO_ISO: Record<string, string> = {
  Brazil: "br",
  Argentina: "ar",
  France: "fr",
  Germany: "de",
  Spain: "es",
  England: "gb-eng",
  Portugal: "pt",
  Netherlands: "nl",
  Italy: "it",
  "United States": "us",
  Mexico: "mx",
  Japan: "jp",
  Nigeria: "ng",
  Morocco: "ma",
  Croatia: "hr",
  Belgium: "be",
  "South Korea": "kr",
  "Korea Republic": "kr",
  Uruguay: "uy",
  Colombia: "co",
  Senegal: "sn",
  Cameroon: "cm",
  Ghana: "gh",
  Switzerland: "ch",
  Poland: "pl",
  Serbia: "rs",
  Canada: "ca",
  Australia: "au",
  Ecuador: "ec",
  "Costa Rica": "cr",
  Tunisia: "tn",
  Iran: "ir",
  "Saudi Arabia": "sa",
  Qatar: "qa",
  Wales: "gb-wls",
  Scotland: "gb-sct",
  Denmark: "dk",
  Sweden: "se",
  Norway: "no",
  Austria: "at",
  "Czech Republic": "cz",
  Ukraine: "ua",
  Turkey: "tr",
  Egypt: "eg",
  Algeria: "dz",
  Chile: "cl",
  Peru: "pe",
  Paraguay: "py",
  Venezuela: "ve",
  Panama: "pa",
  Jamaica: "jm",
  Honduras: "hn",
  "New Zealand": "nz",
  "South Africa": "za",
  "Ivory Coast": "ci",
  "Côte d'Ivoire": "ci",
};

export function isoCodeForTeam(teamName: string, teamCode?: string): string {
  if (teamCode) {
    const fromTla = TLA_TO_ISO[teamCode.toUpperCase()];
    if (fromTla) return fromTla;
  }

  const fromName = NAME_TO_ISO[teamName];
  if (fromName) return fromName;

  const fromMajor = MAJOR_NATIONS.find(
    (n) =>
      n.code === teamCode?.toUpperCase() ||
      n.name.toLowerCase() === teamName.toLowerCase()
  );
  if (fromMajor) {
    const mapped = TLA_TO_ISO[fromMajor.code];
    if (mapped) return mapped;
  }

  for (const [name, iso] of Object.entries(NAME_TO_ISO)) {
    if (teamName.toLowerCase().includes(name.toLowerCase())) return iso;
  }

  return "un";
}