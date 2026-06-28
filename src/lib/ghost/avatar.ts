import type { GhostTraits } from "@/types/ghost";
import { WC_2026_NATIONS } from "@/lib/football/teams";
import {
  buildAvatarVisualProfile,
  seededRandom,
  type GhostMemorySnapshot,
} from "@/lib/ghost/avatar-visual-profile";

type TeamPalette = { primary: string; secondary: string; accent: string };

const NATION_PALETTES: Record<string, TeamPalette> = {
  ALG: { primary: "#FFFFFF", secondary: "#006233", accent: "#D21034" },
  ARG: { primary: "#75AADB", secondary: "#FFFFFF", accent: "#F6B40E" },
  AUS: { primary: "#FFCD00", secondary: "#00843D", accent: "#0052B4" },
  AUT: { primary: "#ED2939", secondary: "#FFFFFF", accent: "#ED2939" },
  BEL: { primary: "#FAE042", secondary: "#000000", accent: "#ED2939" },
  BIH: { primary: "#002395", secondary: "#FECB00", accent: "#FFFFFF" },
  BRA: { primary: "#FFDF00", secondary: "#009739", accent: "#002776" },
  CAN: { primary: "#FF0000", secondary: "#FFFFFF", accent: "#FF0000" },
  CPV: { primary: "#003893", secondary: "#FFFFFF", accent: "#CF2027" },
  COL: { primary: "#FCD116", secondary: "#003893", accent: "#CE1126" },
  COD: { primary: "#007FFF", secondary: "#F7D618", accent: "#CE1026" },
  CRO: { primary: "#FF0000", secondary: "#FFFFFF", accent: "#171796" },
  CUW: { primary: "#002B7F", secondary: "#F9E814", accent: "#FFFFFF" },
  CZE: { primary: "#11457E", secondary: "#FFFFFF", accent: "#D7141A" },
  ECU: { primary: "#FFDD00", secondary: "#034EA2", accent: "#ED1C24" },
  EGY: { primary: "#CE1126", secondary: "#FFFFFF", accent: "#000000" },
  ENG: { primary: "#FFFFFF", secondary: "#CE1124", accent: "#00247D" },
  FRA: { primary: "#0055A4", secondary: "#EF4135", accent: "#FFFFFF" },
  GER: { primary: "#000000", secondary: "#DD0000", accent: "#FFCE00" },
  GHA: { primary: "#FCD116", secondary: "#006B3F", accent: "#CE1126" },
  HAI: { primary: "#00209F", secondary: "#D21034", accent: "#FFFFFF" },
  IRN: { primary: "#FFFFFF", secondary: "#239F40", accent: "#DA0000" },
  IRQ: { primary: "#CE1126", secondary: "#FFFFFF", accent: "#000000" },
  CIV: { primary: "#F77F00", secondary: "#009E60", accent: "#FFFFFF" },
  JPN: { primary: "#BC002D", secondary: "#FFFFFF", accent: "#1D2E5B" },
  JOR: { primary: "#007A3D", secondary: "#FFFFFF", accent: "#CE1126" },
  MEX: { primary: "#006847", secondary: "#CE1126", accent: "#FFFFFF" },
  MAR: { primary: "#C1272D", secondary: "#006233", accent: "#F4C542" },
  NED: { primary: "#FF6600", secondary: "#21468B", accent: "#FFFFFF" },
  NZL: { primary: "#000000", secondary: "#FFFFFF", accent: "#C8102E" },
  NOR: { primary: "#BA0C2F", secondary: "#00205B", accent: "#FFFFFF" },
  PAN: { primary: "#DA121A", secondary: "#FFFFFF", accent: "#005293" },
  PAR: { primary: "#D52B1E", secondary: "#FFFFFF", accent: "#0038A8" },
  POR: { primary: "#006600", secondary: "#FF0000", accent: "#FFD700" },
  QAT: { primary: "#8D1B3D", secondary: "#FFFFFF", accent: "#8D1B3D" },
  KSA: { primary: "#006C35", secondary: "#FFFFFF", accent: "#006C35" },
  SCO: { primary: "#005EB8", secondary: "#FFFFFF", accent: "#005EB8" },
  SEN: { primary: "#00853F", secondary: "#FDEF42", accent: "#E31B23" },
  RSA: { primary: "#007749", secondary: "#FFB81C", accent: "#000000" },
  KOR: { primary: "#CD2E3A", secondary: "#0047A0", accent: "#FFFFFF" },
  ESP: { primary: "#AA151B", secondary: "#F1BF00", accent: "#1E3A8A" },
  SWE: { primary: "#006AA7", secondary: "#FECC00", accent: "#FFFFFF" },
  SUI: { primary: "#FF0000", secondary: "#FFFFFF", accent: "#FF0000" },
  TUN: { primary: "#E70013", secondary: "#FFFFFF", accent: "#E70013" },
  TUR: { primary: "#E30A17", secondary: "#FFFFFF", accent: "#E30A17" },
  USA: { primary: "#B22234", secondary: "#3C3B6E", accent: "#FFFFFF" },
  URU: { primary: "#55B7E9", secondary: "#FFFFFF", accent: "#FCD116" },
  UZB: { primary: "#1EB53A", secondary: "#FFFFFF", accent: "#0099B5" },
};

const DEFAULT_PALETTE: TeamPalette = {
  primary: "#F4C542",
  secondary: "#0A1020",
  accent: "#94A3B8",
};

function teamCodeFromName(team: string, teamCode?: string): string {
  if (teamCode) return teamCode;
  return WC_2026_NATIONS.find((n) => n.name === team)?.code ?? "UNK";
}

function moodFace(mood: string, headY: number) {
  const mouthY = headY + 6;
  if (["fervent", "charged", "electric", "euphoric"].includes(mood)) {
    return { brow: -1, mouth: `M 44 ${mouthY} Q 50 ${mouthY + 4} 56 ${mouthY}`, eyeH: 1.1 };
  }
  if (["reflective", "devoted", "calm", "bantering", "debating"].includes(mood)) {
    return { brow: 0, mouth: `M 45 ${mouthY} Q 50 ${mouthY - 2} 55 ${mouthY}`, eyeH: 0.95 };
  }
  if (["defiant", "fierce", "legendary"].includes(mood)) {
    return { brow: 1, mouth: `M 44 ${mouthY + 2} L 56 ${mouthY + 2}`, eyeH: 1 };
  }
  return { brow: 0, mouth: `M 44 ${mouthY} Q 50 ${mouthY + 2} 56 ${mouthY}`, eyeH: 1 };
}

export function buildGhostAvatarDataUri(params: {
  team: string;
  teamCode?: string;
  walletAddress?: string;
  traits?: GhostTraits;
  mood?: string;
  name: string;
  evolutionScore?: number;
  confidence?: number;
  memories?: GhostMemorySnapshot[];
  memorySummary?: string;
}): string {
  const profile = buildAvatarVisualProfile(params);
  const rand = seededRandom(profile.seed);
  const code = teamCodeFromName(params.team, params.teamCode);
  const palette = NATION_PALETTES[code] ?? DEFAULT_PALETTE;
  const id = profile.seed;
  const floatY = -profile.floatHeight;
  const headY = 30 + floatY * 0.2;
  const face = moodFace(profile.mood, headY);
  const op = profile.ghostOpacity;
  const kit = profile.kitDetailLevel;
  const tilt = (rand() - 0.5) * 4;
  const jerseyVariant = Math.floor(rand() * 3);
  const kitNumber = 7 + Math.floor(rand() * 9);

  const stadiumLights = profile.hasStadiumHaze
    ? Array.from({ length: 7 }, (_, i) => {
        const x = 8 + i * 13;
        const r = 1.2 + rand() * 1.8;
        return `<circle cx="${x}" cy="${8 + rand() * 6}" r="${r}" fill="${palette.accent}" opacity="${0.2 + rand() * 0.35}" />`;
      }).join("")
    : "";

  const lightRays =
    profile.tier >= 2
      ? `<path d="M 50 0 L 38 55 L 50 48 L 62 55 Z" fill="url(#ray-${id})" opacity="${0.08 + profile.auraIntensity * 0.12}"/>`
      : "";

  const legendHalo = profile.hasLegendHalo
    ? `<ellipse cx="50" cy="42" rx="34" ry="38" fill="none" stroke="#F4C542" stroke-width="0.8" opacity="0.45"/>
       <ellipse cx="50" cy="42" rx="36" ry="40" fill="none" stroke="#F4C542" stroke-width="0.35" opacity="0.2"/>`
    : "";

  const aura = `<ellipse cx="50" cy="72" rx="${30 + profile.tier * 2}" ry="${38 + profile.tier * 3}" fill="url(#aura-${id})" opacity="${profile.auraIntensity}"/>`;

  const wisps = Array.from(
    { length: 3 + profile.tier + Math.floor(profile.interactionIntensity / 30) },
    (_, i) => {
      const x = 30 + rand() * 40;
      const h = 12 + rand() * (10 + profile.tier * 6);
      return `<path d="M ${x} 118 Q ${x + (rand() - 0.5) * 6} ${118 - h / 2} ${x + (rand() - 0.5) * 4} ${118 - h}" stroke="${palette.primary}" stroke-width="1.2" fill="none" opacity="${0.15 + rand() * 0.25}" />`;
    }
  ).join("");

  const reactionSparks = profile.hasReactionSparks
    ? Array.from({ length: 4 + profile.tier }, (_, i) => {
        const x = 18 + rand() * 64;
        const y = 20 + rand() * 50;
        return `<circle cx="${x}" cy="${y}" r="${0.6 + rand()}" fill="${i % 2 ? palette.primary : "#F4C542"}" opacity="${0.35 + rand() * 0.4}"/>`;
      }).join("")
    : "";

  const commentWisps = profile.hasCommentEnergy
    ? `<path d="M 14 52 Q 22 48 18 44" stroke="${palette.accent}" stroke-width="0.8" fill="none" opacity="0.35"/>
       <path d="M 86 58 Q 78 54 82 50" stroke="${palette.accent}" stroke-width="0.8" fill="none" opacity="0.35"/>`
    : "";

  const mediaGlow = profile.hasMediaGlow
    ? `<rect x="38" y="52" width="24" height="28" rx="4" fill="${palette.primary}" opacity="0.08" filter="url(#soft-${id})"/>`
    : "";

  const collar =
    kit >= 2
      ? `<path d="M 42 46 Q 50 50 58 46" stroke="${palette.accent}" stroke-width="1.2" fill="none" opacity="0.85"/>`
      : "";

  const crest =
    kit >= 2
      ? `<circle cx="50" cy="58" r="4.5" fill="${palette.accent}" opacity="0.9"/>
         <text x="50" y="59.2" text-anchor="middle" font-size="3.8" fill="${palette.secondary}" font-weight="bold">${code.slice(0, 2)}</text>`
      : "";

  const jerseyBase =
    jerseyVariant === 0
      ? `<path d="M 38 48 L 34 56 L 36 82 L 64 82 L 66 56 L 62 48 Z" fill="url(#kit-${id})" opacity="0.96"/>
         <rect x="38" y="48" width="24" height="8" fill="${palette.primary}" opacity="0.92"/>`
      : jerseyVariant === 1
        ? `<path d="M 38 48 L 34 56 L 36 82 L 64 82 L 66 56 L 62 48 Z" fill="${palette.primary}" opacity="0.94"/>
           <rect x="47" y="48" width="6" height="34" fill="${palette.secondary}" opacity="0.9"/>`
        : `<path d="M 38 48 L 34 56 L 36 82 L 64 82 L 66 56 L 62 48 Z" fill="url(#kit-${id})" opacity="0.95"/>
           <line x1="38" y1="62" x2="62" y2="62" stroke="${palette.primary}" stroke-width="2.5" opacity="0.9"/>`;

  const kitNumberMark =
    kit >= 3
      ? `<text x="50" y="72" text-anchor="middle" font-size="9" font-weight="bold" fill="${palette.accent}" opacity="0.92">${kitNumber}</text>`
      : "";

  const sleeveDetail =
    kit >= 4
      ? `<line x1="36" y1="58" x2="34" y2="66" stroke="${palette.accent}" stroke-width="1.5" opacity="0.7"/>
         <line x1="64" y1="58" x2="66" y2="66" stroke="${palette.accent}" stroke-width="1.5" opacity="0.7"/>`
      : "";

  const goldTrim =
    kit >= 5
      ? `<path d="M 38 48 L 62 48" stroke="#F4C542" stroke-width="0.8" opacity="0.65"/>`
      : "";

  const scarf = profile.hasScarf
    ? `<path d="M 36 46 Q 50 54 64 46 L 61 68 Q 50 62 39 68 Z" fill="${palette.primary}" opacity="0.75"/>
       <path d="M 39 68 L 35 78 M 61 68 L 65 76" stroke="${palette.secondary}" stroke-width="1.8" stroke-linecap="round" opacity="0.8"/>`
    : "";

  const captainBand = profile.hasCaptainBand
    ? `<rect x="57" y="50" width="10" height="3.5" rx="0.8" fill="${profile.hasLegendHalo ? "#F4C542" : palette.accent}" opacity="0.95"/>
       <text x="62" y="52.6" text-anchor="middle" font-size="2.8" fill="#0A1020" font-weight="bold">C</text>`
    : "";

  const head = `<ellipse cx="50" cy="${headY}" rx="8.5" ry="9.5" fill="url(#skin-${id})" opacity="${op}"/>
    <ellipse cx="50" cy="${headY - 4}" rx="7" ry="4" fill="#FFFFFF" opacity="0.12"/>`;

  const browY = headY - 2 + face.brow;
  const eyes = `<ellipse cx="46" cy="${headY + 1}" rx="1.6" ry="${1.4 * face.eyeH}" fill="#0A1020" opacity="0.9"/>
    <ellipse cx="54" cy="${headY + 1}" rx="1.6" ry="${1.4 * face.eyeH}" fill="#0A1020" opacity="0.9"/>
    <path d="M 43 ${browY} Q 46 ${browY - 1} 48 ${browY}" stroke="#0A1020" stroke-width="0.7" fill="none" opacity="0.7"/>
    <path d="M 52 ${browY} Q 54 ${browY - 1} 57 ${browY}" stroke="#0A1020" stroke-width="0.7" fill="none" opacity="0.7"/>
    <path d="${face.mouth}" stroke="#0A1020" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.85"/>`;

  const pose = profile.pose;
  const leftArm =
    pose === "celebration"
      ? `<path d="M 36 54 Q 24 46 20 34" stroke="url(#limb-${id})" stroke-width="5" stroke-linecap="round" fill="none" opacity="${op}"/>`
      : pose === "clutch_ball"
        ? `<path d="M 36 56 Q 28 64 24 72" stroke="url(#limb-${id})" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="${op}"/>`
        : `<path d="M 36 56 Q 30 66 28 76" stroke="url(#limb-${id})" stroke-width="4" stroke-linecap="round" fill="none" opacity="${op}"/>`;

  const rightArm =
    pose === "celebration"
      ? `<path d="M 64 54 Q 76 46 80 34" stroke="url(#limb-${id})" stroke-width="5" stroke-linecap="round" fill="none" opacity="${op}"/>`
      : pose === "defiant"
        ? `<path d="M 64 54 Q 72 50 76 44" stroke="url(#limb-${id})" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="${op}"/>`
        : pose === "clutch_ball"
          ? `<path d="M 64 56 Q 70 62 74 68" stroke="url(#limb-${id})" stroke-width="4.5" stroke-linecap="round" fill="none" opacity="${op}"/>`
          : `<path d="M 64 56 Q 70 66 72 76" stroke="url(#limb-${id})" stroke-width="4" stroke-linecap="round" fill="none" opacity="${op}"/>`;

  const legs = `<rect x="41" y="82" width="7" height="22" rx="2.5" fill="url(#limb-${id})" opacity="${op * 0.95}"/>
    <rect x="52" y="82" width="7" height="22" rx="2.5" fill="url(#limb-${id})" opacity="${op * 0.95}"/>
    <ellipse cx="44.5" cy="106" rx="5.5" ry="2.8" fill="${palette.secondary}" opacity="0.92"/>
    <ellipse cx="55.5" cy="106" rx="5.5" ry="2.8" fill="${palette.secondary}" opacity="0.92"/>
    <rect x="39" y="103" width="11" height="4" rx="1.5" fill="${palette.primary}" opacity="0.9"/>
    <rect x="50" y="103" width="11" height="4" rx="1.5" fill="${palette.primary}" opacity="0.9"/>`;

  const football =
    pose === "clutch_ball" || pose === "match_ready"
      ? `<circle cx="78" cy="72" r="6" fill="#FFFFFF" opacity="0.1"/>
         <circle cx="78" cy="72" r="6" fill="none" stroke="#FFFFFF" opacity="0.22" stroke-width="0.5"/>
         <path d="M 78 66 L 79.5 69.5 L 83 69.5 L 80.2 72 L 81 75.5 L 78 73.8 L 75 75.5 L 75.8 72 L 73 69.5 L 76.5 69.5 Z" fill="#FFFFFF" opacity="0.3"/>`
      : "";

  const ghostEcho =
    profile.tier >= 1
      ? `<g opacity="${0.12 + profile.auraIntensity * 0.15}" transform="translate(2.5 ${3 + floatY * 0.3})">
           <ellipse cx="50" cy="${headY + 14}" rx="10" ry="22" fill="${palette.primary}" filter="url(#soft-${id})"/>
         </g>`
      : "";

  const stageBadge =
    profile.tier >= 1
      ? `<text x="50" y="132" text-anchor="middle" font-size="5" fill="#F4C542" opacity="0.55" letter-spacing="0.15em">${profile.stage.toUpperCase()}</text>`
      : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" role="img">
  <defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0c1428"/>
      <stop offset="55%" stop-color="#0A1020"/>
      <stop offset="100%" stop-color="#142a1c"/>
    </linearGradient>
    <linearGradient id="kit-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.secondary}"/>
      <stop offset="100%" stop-color="${palette.secondary}"/>
    </linearGradient>
    <linearGradient id="skin-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E8EEF4"/>
      <stop offset="100%" stop-color="#B8C4D0"/>
    </linearGradient>
    <linearGradient id="limb-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#E8EEF4"/>
      <stop offset="100%" stop-color="#C5D0DC"/>
    </linearGradient>
    <radialGradient id="aura-${id}" cx="50%" cy="60%" r="65%">
      <stop offset="0%" stop-color="${palette.primary}"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <linearGradient id="ray-${id}" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#F4C542"/>
      <stop offset="100%" stop-color="transparent"/>
    </linearGradient>
    <filter id="glow-${id}">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="soft-${id}">
      <feGaussianBlur stdDeviation="3"/>
    </filter>
  </defs>
  <rect width="100" height="140" rx="14" fill="url(#bg-${id})"/>
  ${stadiumLights}
  ${lightRays}
  <rect x="0" y="112" width="100" height="28" fill="#163322" opacity="0.5"/>
  <line x1="0" y1="112" x2="100" y2="112" stroke="${palette.primary}" stroke-width="0.4" opacity="0.3"/>
  ${reactionSparks}
  ${legendHalo}
  ${aura}
  ${ghostEcho}
  <g transform="translate(0 ${floatY}) scale(${profile.presenceScale}) rotate(${tilt.toFixed(1)} 50 70)" filter="url(#glow-${id})">
    ${wisps}
    ${commentWisps}
    ${scarf}
    ${legs}
    ${leftArm}
    ${rightArm}
    ${mediaGlow}
    ${jerseyBase}
    ${collar}
    ${crest}
    ${sleeveDetail}
    ${goldTrim}
    ${kitNumberMark}
    ${captainBand}
    ${head}
    ${eyes}
  </g>
  ${football}
  ${stageBadge}
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export type { GhostMemorySnapshot };
export { buildAvatarVisualProfile } from "@/lib/ghost/avatar-visual-profile";
export { buildGhostAvatarImagePrompt } from "@/lib/ghost/avatar-prompt";