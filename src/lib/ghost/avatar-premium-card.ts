import type { GhostTraits } from "@/types/ghost";
import { WC_2026_NATIONS } from "@/lib/football/teams";
import {
  buildAvatarVisualProfile,
  seededRandom,
  type GhostMemorySnapshot,
} from "@/lib/ghost/avatar-visual-profile";
import type { WalletIdentityProfile } from "@/lib/ghost/identity-distinctness";

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

const ACCENT_GLOWS: Record<string, string> = {
  gold_rim_kit: "#F4C542",
  shadow_ghost_trail: "#64748B",
  ember_reaction_sparks: "#F97316",
  cool_blue_haze: "#38BDF8",
  crimson_passion_glow: "#EF4444",
  emerald_hope_aura: "#22C55E",
  violet_drama_flare: "#A855F7",
  silver_resilience_edge: "#CBD5E1",
};

function teamCode(team: string, teamCode?: string): string {
  if (teamCode) return teamCode;
  return WC_2026_NATIONS.find((n) => n.name === team)?.code ?? "UNK";
}

export type PremiumCardParams = {
  name: string;
  team: string;
  teamCode?: string;
  walletAddress?: string;
  traits?: GhostTraits;
  mood?: string;
  evolutionScore?: number;
  confidence?: number;
  memories?: GhostMemorySnapshot[];
  memorySummary?: string;
  identity?: WalletIdentityProfile;
};

/** Premium vertical player-card SVG for My Ghost page only. */
export function buildPremiumGhostCardDataUri(params: PremiumCardParams): string {
  const profile = buildAvatarVisualProfile({ ...params, identity: params.identity });
  const rand = seededRandom(profile.seed);
  const code = teamCode(params.team, params.teamCode);
  const palette = NATION_PALETTES[code] ?? DEFAULT_PALETTE;
  const accentGlow = ACCENT_GLOWS[profile.visualAccentKey] ?? palette.accent;
  const id = profile.seed;
  const floatY = -profile.floatHeight * 0.6;
  const kit = profile.kitDetailLevel;
  const op = Math.min(0.88, profile.ghostOpacity * 0.92);
  const kitNumber = 7 + Math.floor(rand() * 9);
  const pose = profile.pose;

  const headY = 34 + floatY * 0.15;
  const shoulderY = headY + 14;
  const waistY = shoulderY + 22;
  const hipY = waistY + 8;

  const faceIntensity =
    profile.mood === "fierce" || profile.mood === "defiant"
      ? "focused"
      : profile.mood === "euphoric" || profile.mood === "electric"
        ? "charged"
        : "calm";

  const stadiumBeams = Array.from({ length: 5 }, (_, i) => {
    const x = 20 + i * 20;
    return `<line x1="${x}" y1="0" x2="${x + (rand() - 0.5) * 8}" y2="55" stroke="${palette.primary}" stroke-width="0.6" opacity="${0.06 + rand() * 0.08}"/>`;
  }).join("");

  const legendFrame = profile.hasLegendHalo
    ? `<rect x="4" y="4" width="112" height="160" rx="12" fill="none" stroke="#F4C542" stroke-width="1.2" opacity="0.55"/>
       <rect x="7" y="7" width="106" height="154" rx="10" fill="none" stroke="#F4C542" stroke-width="0.4" opacity="0.25"/>`
    : `<rect x="6" y="6" width="108" height="156" rx="11" fill="none" stroke="${accentGlow}" stroke-width="0.5" opacity="0.35"/>`;

  const ghostTrail = `<ellipse cx="60" cy="${hipY + 38}" rx="22" ry="6" fill="${accentGlow}" opacity="${0.12 + profile.auraIntensity * 0.15}" filter="url(#trail-${id})"/>`;

  const etherealSilhouette = `<g opacity="${0.14 + profile.auraIntensity * 0.12}" transform="translate(3 ${floatY + 4})">
    <path d="M 42 ${shoulderY - 2} L 38 ${waistY + 18} L 46 ${hipY + 34} L 54 ${hipY + 34} L 62 ${waistY + 18} L 58 ${shoulderY - 2} Z" fill="${accentGlow}" filter="url(#trail-${id})"/>
  </g>`;

  const torso = `<path d="M 44 ${shoulderY} Q 60 ${shoulderY - 3} 76 ${shoulderY} L 72 ${waistY} Q 60 ${waistY + 4} 48 ${waistY} Z" fill="url(#kit-main-${id})" opacity="${op}"/>
    <path d="M 48 ${shoulderY + 4} L 72 ${shoulderY + 4} L 70 ${waistY - 2} L 50 ${waistY - 2} Z" fill="url(#kit-highlight-${id})" opacity="${op * 0.85}"/>`;

  const kitStripes =
    kit >= 2
      ? `<rect x="58" y="${shoulderY + 2}" width="4" height="${waistY - shoulderY - 4}" fill="${palette.primary}" opacity="0.88"/>`
      : "";

  const crest =
    kit >= 2
      ? `<circle cx="60" cy="${shoulderY + 14}" r="5.5" fill="${palette.accent}" opacity="0.95"/>
         <text x="60" y="${shoulderY + 15.5}" text-anchor="middle" font-size="4.5" font-weight="700" fill="${palette.secondary}">${code.slice(0, 2)}</text>`
      : "";

  const kitNumberMark =
    kit >= 3
      ? `<text x="60" y="${waistY - 4}" text-anchor="middle" font-size="11" font-weight="700" fill="${palette.accent}" opacity="0.95">${kitNumber}</text>`
      : "";

  const goldTrim =
    kit >= 5
      ? `<path d="M 44 ${shoulderY} L 76 ${shoulderY}" stroke="#F4C542" stroke-width="0.9" opacity="0.7"/>`
      : "";

  const captainBand = profile.hasCaptainBand
    ? `<rect x="70" y="${shoulderY + 6}" width="11" height="4" rx="1" fill="${profile.hasLegendHalo ? "#F4C542" : palette.accent}"/>
       <text x="75.5" y="${shoulderY + 8.8}" text-anchor="middle" font-size="3.2" font-weight="700" fill="#0A1020">C</text>`
    : "";

  const head = `<ellipse cx="60" cy="${headY}" rx="9" ry="10" fill="url(#skin-${id})" opacity="${op}"/>
    <path d="M 52 ${headY + 2} Q 60 ${headY + 8} 68 ${headY + 2}" fill="none" stroke="#0A1020" stroke-width="0.5" opacity="0.25"/>`;

  const eyes =
    faceIntensity === "focused"
      ? `<line x1="55" y1="${headY + 1}" x2="57.5" y2="${headY + 1}" stroke="#0A1020" stroke-width="1.1" stroke-linecap="round"/>
         <line x1="62.5" y1="${headY + 1}" x2="65" y2="${headY + 1}" stroke="#0A1020" stroke-width="1.1" stroke-linecap="round"/>
         <path d="M 54 ${headY - 2} L 57 ${headY - 3} M 63 ${headY - 3} L 66 ${headY - 2}" stroke="#0A1020" stroke-width="0.6" opacity="0.7"/>`
      : faceIntensity === "charged"
        ? `<ellipse cx="56.5" cy="${headY + 1}" rx="1.8" ry="1.2" fill="#0A1020"/>
           <ellipse cx="63.5" cy="${headY + 1}" rx="1.8" ry="1.2" fill="#0A1020"/>
           <path d="M 55 ${headY + 5} Q 60 ${headY + 7} 65 ${headY + 5}" stroke="#0A1020" stroke-width="0.8" fill="none"/>`
        : `<ellipse cx="56.5" cy="${headY + 1}" rx="1.5" ry="1.1" fill="#0A1020" opacity="0.85"/>
           <ellipse cx="63.5" cy="${headY + 1}" rx="1.5" ry="1.1" fill="#0A1020" opacity="0.85"/>
           <path d="M 56 ${headY + 5} Q 60 ${headY + 4} 64 ${headY + 5}" stroke="#0A1020" stroke-width="0.7" fill="none" opacity="0.8"/>`;

  const leftArm =
    pose === "celebration"
      ? `<path d="M 44 ${shoulderY + 4} Q 28 ${shoulderY - 6} 22 ${headY - 4}" stroke="url(#limb-${id})" stroke-width="6" stroke-linecap="round" fill="none" opacity="${op}"/>`
      : pose === "defiant"
        ? `<path d="M 44 ${shoulderY + 6} Q 32 ${shoulderY + 2} 26 ${shoulderY - 8}" stroke="url(#limb-${id})" stroke-width="5.5" stroke-linecap="round" fill="none" opacity="${op}"/>`
        : `<path d="M 44 ${shoulderY + 6} Q 36 ${waistY} 34 ${waistY + 14}" stroke="url(#limb-${id})" stroke-width="5" stroke-linecap="round" fill="none" opacity="${op}"/>`;

  const rightArm =
    pose === "celebration"
      ? `<path d="M 76 ${shoulderY + 4} Q 92 ${shoulderY - 6} 98 ${headY - 4}" stroke="url(#limb-${id})" stroke-width="6" stroke-linecap="round" fill="none" opacity="${op}"/>`
      : pose === "clutch_ball"
        ? `<path d="M 76 ${shoulderY + 6} Q 84 ${waistY + 4} 88 ${waistY + 16}" stroke="url(#limb-${id})" stroke-width="5.5" stroke-linecap="round" fill="none" opacity="${op}"/>`
        : `<path d="M 76 ${shoulderY + 6} Q 84 ${waistY} 86 ${waistY + 14}" stroke="url(#limb-${id})" stroke-width="5" stroke-linecap="round" fill="none" opacity="${op}"/>`;

  const shorts = `<path d="M 48 ${waistY} L 72 ${waistY} L 70 ${hipY + 6} Q 60 ${hipY + 10} 50 ${hipY + 6} Z" fill="${palette.secondary}" opacity="${op * 0.96}"/>`;

  const leftLeg = `<path d="M 52 ${hipY + 6} L 50 ${hipY + 28} L 48 ${hipY + 42}" stroke="url(#limb-${id})" stroke-width="7" stroke-linecap="round" fill="none" opacity="${op}"/>
    <rect x="45" y="${hipY + 24}" width="8" height="10" rx="1" fill="${palette.primary}" opacity="0.9"/>
    <ellipse cx="47" cy="${hipY + 44}" rx="6" ry="3" fill="#1a1a1a" opacity="0.95"/>`;

  const rightLeg = `<path d="M 68 ${hipY + 6} L 70 ${hipY + 28} L 72 ${hipY + 42}" stroke="url(#limb-${id})" stroke-width="7" stroke-linecap="round" fill="none" opacity="${op}"/>
    <rect x="67" y="${hipY + 24}" width="8" height="10" rx="1" fill="${palette.primary}" opacity="0.9"/>
    <ellipse cx="73" cy="${hipY + 44}" rx="6" ry="3" fill="#1a1a1a" opacity="0.95"/>`;

  const showBall =
    pose === "clutch_ball" || pose === "match_ready" || pose === "celebration";
  const ballX = pose === "clutch_ball" ? 90 : 94;
  const ballY = waistY + 10;
  const football = showBall
    ? `<g class="gg-ball" data-animate="bob">
         <circle cx="${ballX}" cy="${ballY}" r="7" fill="#f8fafc" opacity="0.12"/>
         <circle cx="${ballX}" cy="${ballY}" r="7" fill="url(#ball-${id})" opacity="0.88"/>
         <path d="M ${ballX} ${ballY - 5} L ${ballX + 1.8} ${ballY - 1.5} L ${ballX + 5} ${ballY - 1.5} L ${ballX + 2.2} ${ballY + 1} L ${ballX + 3} ${ballY + 4.5} L ${ballX} ${ballY + 2.8} L ${ballX - 3} ${ballY + 4.5} L ${ballX - 2.2} ${ballY + 1} L ${ballX - 5} ${ballY - 1.5} L ${ballX - 1.8} ${ballY - 1.5} Z" fill="#0A1020" opacity="0.2"/>
       </g>`
    : "";

  const aura = `<ellipse cx="60" cy="${hipY + 30}" rx="${28 + profile.tier * 2}" ry="${10 + profile.tier}" fill="url(#aura-${id})" opacity="${profile.auraIntensity * 0.85}"/>`;

  const sparks = profile.hasReactionSparks
    ? Array.from({ length: 3 + profile.tier }, (_, i) => {
        const x = 14 + rand() * 92;
        const y = 18 + rand() * 60;
        return `<circle cx="${x}" cy="${y}" r="${0.5 + rand() * 0.8}" fill="${accentGlow}" opacity="${0.3 + rand() * 0.35}"/>`;
      }).join("")
    : "";

  const stageLabel = profile.stage.toUpperCase();
  const nationLabel = code;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 168" role="img" aria-label="${params.name} premium GoalGhost card">
  <defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0f1728"/>
      <stop offset="45%" stop-color="#0A1020"/>
      <stop offset="100%" stop-color="#122018"/>
    </linearGradient>
    <linearGradient id="kit-main-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${palette.secondary}"/>
      <stop offset="55%" stop-color="${palette.secondary}"/>
      <stop offset="100%" stop-color="${palette.primary}"/>
    </linearGradient>
    <linearGradient id="kit-highlight-${id}" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
    </linearGradient>
    <linearGradient id="skin-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#d4dce6"/>
      <stop offset="100%" stop-color="#9aa8b8"/>
    </linearGradient>
    <linearGradient id="limb-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#dce4ec"/>
      <stop offset="100%" stop-color="#a8b4c2"/>
    </linearGradient>
    <radialGradient id="aura-${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accentGlow}"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="ball-${id}" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <filter id="glow-${id}">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="trail-${id}">
      <feGaussianBlur stdDeviation="4"/>
    </filter>
    <filter id="card-depth-${id}">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>
  <rect width="120" height="168" rx="14" fill="url(#bg-${id})" filter="url(#card-depth-${id})"/>
  ${stadiumBeams}
  <rect x="0" y="130" width="120" height="38" fill="#142a1c" opacity="0.55"/>
  <line x1="0" y1="130" x2="120" y2="130" stroke="${palette.primary}" stroke-width="0.5" opacity="0.25"/>
  ${legendFrame}
  ${sparks}
  ${aura}
  ${etherealSilhouette}
  ${ghostTrail}
  <g class="gg-player" data-animate="float" transform="translate(0 ${floatY}) scale(${profile.presenceScale})" filter="url(#glow-${id})">
    ${leftLeg}
    ${rightLeg}
    ${shorts}
    ${torso}
    ${kitStripes}
    ${crest}
    ${kitNumberMark}
    ${goldTrim}
    ${captainBand}
    ${leftArm}
    ${rightArm}
    ${head}
    ${eyes}
  </g>
  ${football}
  <text x="12" y="158" font-size="5.5" fill="#F4C542" opacity="0.7" letter-spacing="0.12em">${stageLabel}</text>
  <text x="108" y="158" text-anchor="end" font-size="5.5" fill="${palette.primary}" opacity="0.75" letter-spacing="0.1em">${nationLabel}</text>
  <text x="60" y="18" text-anchor="middle" font-size="4.5" fill="#94a3b8" opacity="0.5" letter-spacing="0.2em">GOALGHOST</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}