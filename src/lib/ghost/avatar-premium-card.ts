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

const TRAIT_RIM: Record<keyof GhostTraits, string> = {
  passion: "#EF4444",
  loyalty: "#3B82F6",
  drama: "#A855F7",
  hope: "#22C55E",
  resilience: "#94A3B8",
};

const CARD_W = 140;
const CARD_H = 196;

function teamCode(team: string, teamCode?: string): string {
  if (teamCode) return teamCode;
  return WC_2026_NATIONS.find((n) => n.name === team)?.code ?? "UNK";
}

function frameStroke(tier: number): { outer: string; inner: string; width: number } {
  if (tier >= 4) return { outer: "#F4C542", inner: "#FFF3C4", width: 2.2 };
  if (tier >= 3) return { outer: "#E8C547", inner: "#F4C542", width: 1.6 };
  if (tier >= 2) return { outer: "#B8C4D4", inner: "#E2E8F0", width: 1.3 };
  if (tier >= 1) return { outer: "#B87333", inner: "#CD7F32", width: 1.1 };
  return { outer: accentMuted(), inner: "#475569", width: 0.8 };
}

function accentMuted(): string {
  return "#64748B";
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
  const traitRim = TRAIT_RIM[profile.dominantTrait];
  const id = profile.seed;
  const kit = profile.kitDetailLevel;
  const op = Math.min(0.92, profile.ghostOpacity);
  const ghostEdge = Math.max(0.35, 1 - op);
  const kitNumber = 7 + Math.floor(rand() * 9);
  const pose = profile.pose;
  const floatY = -profile.floatHeight * 0.75;
  const frame = frameStroke(profile.tier);
  const cx = CARD_W / 2;

  const headY = 52 + floatY * 0.12;
  const neckY = headY + 11;
  const shoulderY = neckY + 5;
  const chestY = shoulderY + 18;
  const waistY = chestY + 14;
  const hipY = waistY + 10;

  const moodKey =
    profile.mood === "fierce" || profile.mood === "defiant"
      ? "fierce"
      : profile.mood === "euphoric" || profile.mood === "electric"
        ? "charged"
        : profile.mood === "calm" || profile.mood === "reflective"
          ? "calm"
          : "focused";

  const lightBurst = `<ellipse cx="${cx}" cy="88" rx="58" ry="72" fill="url(#burst-${id})" opacity="0.55"/>
    <ellipse cx="${cx}" cy="100" rx="42" ry="50" fill="url(#burst-core-${id})" opacity="0.4"/>`;

  const holoFoil = profile.tier >= 3
    ? `<rect x="8" y="24" width="124" height="140" fill="url(#holo-${id})" opacity="0.08" style="mix-blend-mode:screen"/>`
    : "";

  const rays = Array.from({ length: 8 }, (_, i) => {
    const angle = (i / 8) * 360;
    const rad = (angle * Math.PI) / 180;
    const x2 = cx + Math.cos(rad) * 70;
    const y2 = 90 + Math.sin(rad) * 80;
    return `<line x1="${cx}" y1="90" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${traitRim}" stroke-width="0.5" opacity="0.07"/>`;
  }).join("");

  const sparks = profile.hasReactionSparks
    ? Array.from({ length: 5 + profile.tier }, (_, i) => {
        const x = 12 + rand() * (CARD_W - 24);
        const y = 30 + rand() * 120;
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.6 + rand()).toFixed(2)}" fill="${accentGlow}" opacity="${(0.35 + rand() * 0.4).toFixed(2)}">
          <animate attributeName="opacity" values="0.2;0.7;0.2" dur="${(3 + rand() * 2).toFixed(1)}s" repeatCount="indefinite"/>
        </circle>`;
      }).join("")
    : "";

  const ghostAura = `<ellipse cx="${cx}" cy="${hipY + 52}" rx="${36 + profile.tier * 3}" ry="${14 + profile.tier * 2}" fill="url(#ghost-floor-${id})" opacity="${(0.5 + profile.auraIntensity * 0.4).toFixed(2)}" filter="url(#soft-${id})"/>`;

  const ghostRimLeft = `<path d="M 38 ${shoulderY} Q 32 ${chestY} 34 ${waistY + 20} L 36 ${hipY + 48}" fill="none" stroke="${accentGlow}" stroke-width="2.5" opacity="${ghostEdge * 0.45}" filter="url(#ghost-glow-${id})"/>`;
  const ghostRimRight = `<path d="M 102 ${shoulderY} Q 108 ${chestY} 106 ${waistY + 20} L 104 ${hipY + 48}" fill="none" stroke="${accentGlow}" stroke-width="2.5" opacity="${ghostEdge * 0.45}" filter="url(#ghost-glow-${id})"/>`;

  const ghostSilhouette = `<g opacity="${(0.1 + profile.auraIntensity * 0.14).toFixed(2)}" transform="translate(4 ${floatY + 6})">
    <path d="M 46 ${shoulderY} L 40 ${waistY + 16} L 48 ${hipY + 50} L 92 ${hipY + 50} L 100 ${waistY + 16} L 94 ${shoulderY} Z" fill="${accentGlow}" filter="url(#soft-${id})"/>
  </g>`;

  const jersey = `<path d="M 46 ${shoulderY} Q ${cx} ${shoulderY - 4} 94 ${shoulderY} L 98 ${chestY} L 92 ${waistY} Q ${cx} ${waistY + 5} 48 ${waistY} L 42 ${chestY} Z" fill="url(#jersey-${id})" opacity="${op}"/>
    <path d="M 50 ${shoulderY + 3} L 90 ${shoulderY + 3} L 88 ${chestY - 4} L 52 ${chestY - 4} Z" fill="url(#jersey-light-${id})" opacity="${(op * 0.7).toFixed(2)}"/>
    <path d="M 42 ${shoulderY + 2} Q 46 ${shoulderY + 8} 48 ${chestY}" fill="none" stroke="${palette.primary}" stroke-width="3" opacity="${(op * 0.85).toFixed(2)}" stroke-linecap="round"/>
    <path d="M 98 ${shoulderY + 2} Q 94 ${shoulderY + 8} 92 ${chestY}" fill="none" stroke="${palette.primary}" stroke-width="3" opacity="${(op * 0.85).toFixed(2)}" stroke-linecap="round"/>`;

  const kitStripe =
    kit >= 2
      ? `<rect x="67" y="${shoulderY + 4}" width="6" height="${waistY - shoulderY - 2}" fill="${palette.primary}" opacity="0.9"/>`
      : "";

  const kitPanel =
    kit >= 4
      ? `<path d="M 52 ${chestY - 2} L 88 ${chestY - 2} L 86 ${waistY - 6} L 54 ${waistY - 6} Z" fill="${palette.accent}" opacity="0.12"/>`
      : "";

  const crest =
    kit >= 2
      ? `<circle cx="${cx}" cy="${shoulderY + 16}" r="7" fill="url(#crest-${id})" stroke="${palette.accent}" stroke-width="0.6"/>
         <text x="${cx}" y="${shoulderY + 18}" text-anchor="middle" font-size="5.5" font-weight="800" fill="${palette.secondary}">${code}</text>`
      : "";

  const kitNum =
    kit >= 3
      ? `<text x="${cx}" y="${waistY - 6}" text-anchor="middle" font-size="14" font-weight="800" fill="${palette.accent}" opacity="0.95" filter="url(#text-shadow-${id})">${kitNumber}</text>`
      : "";

  const collar = `<path d="M 54 ${neckY} Q ${cx} ${neckY + 5} 86 ${neckY}" fill="none" stroke="${palette.accent}" stroke-width="1.4" opacity="0.85"/>`;

  const captainBand = profile.hasCaptainBand
    ? `<rect x="88" y="${shoulderY + 8}" width="13" height="5" rx="1.2" fill="${profile.hasLegendHalo ? "#F4C542" : palette.accent}" stroke="#0A1020" stroke-width="0.3"/>
       <text x="94.5" y="${shoulderY + 11.8}" text-anchor="middle" font-size="4" font-weight="800" fill="#0A1020">C</text>`
    : "";

  const goldTrim =
    kit >= 5 || profile.hasLegendHalo
      ? `<path d="M 46 ${shoulderY} L 94 ${shoulderY}" stroke="#F4C542" stroke-width="1.2" opacity="0.8"/>
         <path d="M 48 ${waistY} L 92 ${waistY}" stroke="#F4C542" stroke-width="0.6" opacity="0.5"/>`
      : "";

  const head = `<ellipse cx="${cx}" cy="${headY}" rx="10.5" ry="11.5" fill="url(#skin-${id})" opacity="${op}"/>
    <path d="M ${cx - 8} ${headY + 1} Q ${cx} ${headY + 9} ${cx + 8} ${headY + 1}" fill="none" stroke="#1e293b" stroke-width="0.6" opacity="0.3"/>
    <ellipse cx="${cx - 5}" cy="${headY - 3}" rx="3" ry="1.5" fill="#fff" opacity="0.08"/>`;

  const face =
    moodKey === "fierce"
      ? `<path d="M ${cx - 9} ${headY - 1} L ${cx - 5} ${headY - 2.5}" stroke="#1e293b" stroke-width="1" stroke-linecap="round"/>
         <path d="M ${cx + 5} ${headY - 2.5} L ${cx + 9} ${headY - 1}" stroke="#1e293b" stroke-width="1" stroke-linecap="round"/>
         <line x1="${cx - 5}" y1="${headY + 1}" x2="${cx - 2}" y2="${headY + 1}" stroke="#1e293b" stroke-width="1.3" stroke-linecap="round"/>
         <line x1="${cx + 2}" y1="${headY + 1}" x2="${cx + 5}" y2="${headY + 1}" stroke="#1e293b" stroke-width="1.3" stroke-linecap="round"/>
         <path d="M ${cx - 5} ${headY + 6} L ${cx + 5} ${headY + 6}" stroke="#1e293b" stroke-width="1" stroke-linecap="round"/>`
      : moodKey === "charged"
        ? `<ellipse cx="${cx - 4.5}" cy="${headY + 1}" rx="2" ry="1.4" fill="#1e293b"/>
           <ellipse cx="${cx + 4.5}" cy="${headY + 1}" rx="2" ry="1.4" fill="#1e293b"/>
           <ellipse cx="${cx - 4}" cy="${headY}" rx="0.6" ry="0.5" fill="#fff" opacity="0.5"/>
           <ellipse cx="${cx + 5}" cy="${headY}" rx="0.6" ry="0.5" fill="#fff" opacity="0.5"/>
           <path d="M ${cx - 5} ${headY + 6} Q ${cx} ${headY + 9} ${cx + 5} ${headY + 6}" stroke="#1e293b" stroke-width="1" fill="none"/>`
        : `<ellipse cx="${cx - 4.5}" cy="${headY + 1}" rx="1.6" ry="1.2" fill="#1e293b" opacity="0.9"/>
           <ellipse cx="${cx + 4.5}" cy="${headY + 1}" rx="1.6" ry="1.2" fill="#1e293b" opacity="0.9"/>
           <path d="M ${cx - 4} ${headY + 6} Q ${cx} ${headY + 5} ${cx + 4} ${headY + 6}" stroke="#1e293b" stroke-width="0.8" fill="none" opacity="0.85"/>`;

  const leftArm =
    pose === "celebration"
      ? `<path d="M 46 ${shoulderY + 6} L 28 ${shoulderY - 12} L 22 ${headY - 8} L 26 ${headY - 14} L 34 ${shoulderY - 4} Z" fill="url(#arm-${id})" opacity="${op}"/>`
      : pose === "defiant"
        ? `<path d="M 46 ${shoulderY + 8} L 30 ${shoulderY + 2} L 24 ${shoulderY - 10} L 32 ${shoulderY - 6} Z" fill="url(#arm-${id})" opacity="${op}"/>`
        : `<path d="M 46 ${shoulderY + 8} L 36 ${chestY + 6} L 32 ${waistY + 10} L 40 ${waistY + 8} Z" fill="url(#arm-${id})" opacity="${op}"/>`;

  const rightArm =
    pose === "celebration"
      ? `<path d="M 94 ${shoulderY + 6} L 112 ${shoulderY - 12} L 118 ${headY - 8} L 114 ${headY - 14} L 106 ${shoulderY - 4} Z" fill="url(#arm-${id})" opacity="${op}"/>`
      : pose === "clutch_ball"
        ? `<path d="M 94 ${shoulderY + 8} L 104 ${chestY + 8} L 108 ${waistY + 14} L 100 ${waistY + 10} Z" fill="url(#arm-${id})" opacity="${op}"/>`
        : pose === "legendary_float"
          ? `<path d="M 94 ${shoulderY + 6} L 108 ${shoulderY - 4} L 112 ${chestY} L 100 ${chestY + 4} Z" fill="url(#arm-${id})" opacity="${op}"/>`
          : `<path d="M 94 ${shoulderY + 8} L 104 ${chestY + 6} L 108 ${waistY + 10} L 100 ${waistY + 8} Z" fill="url(#arm-${id})" opacity="${op}"/>`;

  const shorts = `<path d="M 48 ${waistY} L 92 ${waistY} L 90 ${hipY + 8} Q ${cx} ${hipY + 14} 50 ${hipY + 8} Z" fill="${palette.secondary}" opacity="${(op * 0.97).toFixed(2)}"/>
    <line x1="${cx}" y1="${waistY}" x2="${cx}" y2="${hipY + 8}" stroke="${palette.primary}" stroke-width="1.2" opacity="0.35"/>`;

  const leftThigh = `<path d="M 52 ${hipY + 8} L 48 ${hipY + 32} L 44 ${hipY + 48} L 54 ${hipY + 46} L 58 ${hipY + 28} Z" fill="url(#leg-${id})" opacity="${op}"/>`;
  const rightThigh = `<path d="M 88 ${hipY + 8} L 92 ${hipY + 32} L 96 ${hipY + 48} L 86 ${hipY + 46} L 82 ${hipY + 28} Z" fill="url(#leg-${id})" opacity="${op}"/>`;

  const leftSock = `<rect x="43" y="${hipY + 30}" width="12" height="14" rx="1" fill="${palette.primary}" opacity="0.92"/>`;
  const rightSock = `<rect x="85" y="${hipY + 30}" width="12" height="14" rx="1" fill="${palette.primary}" opacity="0.92"/>`;

  const leftBoot = `<path d="M 40 ${hipY + 46} L 56 ${hipY + 46} L 58 ${hipY + 52} L 38 ${hipY + 52} Z" fill="#111827" opacity="0.95"/>
    <ellipse cx="48" cy="${hipY + 53}" rx="10" ry="3.5" fill="#0f172a"/>`;
  const rightBoot = `<path d="M 84 ${hipY + 46} L 100 ${hipY + 46} L 102 ${hipY + 52} L 82 ${hipY + 52} Z" fill="#111827" opacity="0.95"/>
    <ellipse cx="92" cy="${hipY + 53}" rx="10" ry="3.5" fill="#0f172a"/>`;

  const stanceOffset = pose === "match_ready" || pose === "clutch_ball" ? 4 : 0;
  const ballX = pose === "clutch_ball" ? 108 : 112;
  const ballY = hipY + 22;
  const showBall =
    pose === "clutch_ball" ||
    pose === "match_ready" ||
    pose === "celebration" ||
    pose === "legendary_float";

  const football = showBall
    ? `<g class="gg-ball" data-animate="bob" transform="translate(${stanceOffset} 0)">
         <circle cx="${ballX}" cy="${ballY}" r="9" fill="#000" opacity="0.15" filter="url(#soft-${id})"/>
         <circle cx="${ballX}" cy="${ballY}" r="8.5" fill="url(#ball-${id})"/>
         <path d="M ${ballX} ${ballY - 6} L ${ballX + 2.2} ${ballY - 2} L ${ballX + 6} ${ballY - 2} L ${ballX + 2.8} ${ballY + 1.5} L ${ballX + 3.8} ${ballY + 5.5} L ${ballX} ${ballY + 3.5} L ${ballX - 3.8} ${ballY + 5.5} L ${ballX - 2.8} ${ballY + 1.5} L ${ballX - 6} ${ballY - 2} L ${ballX - 2.2} ${ballY - 2} Z" fill="#1e293b" opacity="0.22"/>
         <ellipse cx="${ballX - 2}" cy="${ballY - 2}" rx="2" ry="1.2" fill="#fff" opacity="0.35"/>
         <animateTransform attributeName="transform" type="translate" values="0,0; 0,-1.5; 0,0" dur="3.5s" repeatCount="indefinite" additive="sum"/>
       </g>`
    : "";

  const legendHalo = profile.hasLegendHalo
    ? `<ellipse cx="${cx}" cy="${headY + 8}" rx="38" ry="44" fill="none" stroke="#F4C542" stroke-width="1" opacity="0.35"/>
       <ellipse cx="${cx}" cy="${headY + 8}" rx="42" ry="48" fill="none" stroke="#F4C542" stroke-width="0.4" opacity="0.18"/>`
    : "";

  const namePlate = params.name.length > 18 ? `${params.name.slice(0, 16)}…` : params.name;
  const displayName = namePlate.toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}" role="img" aria-label="${params.name} premium GoalGhost player card">
  <defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#141c32"/>
      <stop offset="35%" stop-color="#0A1020"/>
      <stop offset="100%" stop-color="#0d1a14"/>
    </linearGradient>
    <radialGradient id="burst-${id}" cx="50%" cy="42%" r="65%">
      <stop offset="0%" stop-color="${traitRim}" stop-opacity="0.35"/>
      <stop offset="55%" stop-color="${palette.secondary}" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="burst-core-${id}" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="${accentGlow}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <linearGradient id="jersey-${id}" x1="0.2" y1="0" x2="0.9" y2="1">
      <stop offset="0%" stop-color="${palette.secondary}"/>
      <stop offset="50%" stop-color="${palette.secondary}"/>
      <stop offset="100%" stop-color="${palette.primary}"/>
    </linearGradient>
    <linearGradient id="jersey-light-${id}" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.15"/>
    </linearGradient>
    <linearGradient id="skin-${id}" x1="0.3" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="#e8eef4"/>
      <stop offset="100%" stop-color="#9aa8b8"/>
    </linearGradient>
    <linearGradient id="arm-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
    <linearGradient id="leg-${id}" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
    <radialGradient id="crest-${id}" cx="40%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${palette.accent}"/>
    </radialGradient>
    <radialGradient id="ball-${id}" cx="35%" cy="28%" r="70%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </radialGradient>
    <radialGradient id="ghost-floor-${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accentGlow}"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <linearGradient id="holo-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#9945FF" stop-opacity="0.6"/>
      <stop offset="33%" stop-color="#14F195" stop-opacity="0.4"/>
      <stop offset="66%" stop-color="#F4C542" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="#9945FF" stop-opacity="0.6"/>
    </linearGradient>
    <linearGradient id="name-plate-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a2236"/>
      <stop offset="100%" stop-color="#0A1020"/>
    </linearGradient>
    <filter id="card-shadow-${id}">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity="0.55"/>
    </filter>
    <filter id="ghost-glow-${id}">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="soft-${id}">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
    <filter id="text-shadow-${id}">
      <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000" flood-opacity="0.5"/>
    </filter>
    <filter id="player-glow-${id}">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="${CARD_W}" height="${CARD_H}" rx="16" fill="url(#bg-${id})" filter="url(#card-shadow-${id})"/>
  ${rays}
  ${lightBurst}
  ${holoFoil}
  <rect x="0" y="152" width="${CARD_W}" height="44" fill="url(#name-plate-${id})" opacity="0.92"/>
  <line x1="0" y1="152" x2="${CARD_W}" y2="152" stroke="${frame.outer}" stroke-width="0.8" opacity="0.5"/>

  <rect x="5" y="5" width="${CARD_W - 10}" height="${CARD_H - 10}" rx="13" fill="none" stroke="${frame.outer}" stroke-width="${frame.width}"/>
  <rect x="8" y="8" width="${CARD_W - 16}" height="${CARD_H - 16}" rx="11" fill="none" stroke="${frame.inner}" stroke-width="0.5" opacity="0.6"/>

  ${sparks}
  ${ghostAura}
  ${ghostSilhouette}
  ${legendHalo}

  <g class="gg-player" data-animate="float" filter="url(#player-glow-${id})">
    <animateTransform attributeName="transform" type="translate" values="0,${floatY}; 0,${floatY - 2.5}; 0,${floatY}" dur="5s" repeatCount="indefinite"/>
    ${leftBoot}
    ${rightBoot}
    ${leftSock}
    ${rightSock}
    ${leftThigh}
    ${rightThigh}
    ${shorts}
    ${jersey}
    ${kitStripe}
    ${kitPanel}
    ${collar}
    ${crest}
    ${kitNum}
    ${goldTrim}
    ${captainBand}
    ${leftArm}
    ${rightArm}
    ${head}
    ${face}
    ${ghostRimLeft}
    ${ghostRimRight}
  </g>
  ${football}

  <text x="12" y="22" font-size="5" fill="#64748b" letter-spacing="0.22em" font-weight="600">GOALGHOST</text>
  <text x="${CARD_W - 12}" y="22" text-anchor="end" font-size="5.5" fill="${traitRim}" font-weight="700" letter-spacing="0.1em">${profile.dominantTrait.toUpperCase()}</text>

  <rect x="10" y="158" width="36" height="14" rx="3" fill="${palette.secondary}" opacity="0.85"/>
  <text x="28" y="168" text-anchor="middle" font-size="7" font-weight="800" fill="${palette.primary}">${code}</text>

  <rect x="${CARD_W - 46}" y="158" width="36" height="14" rx="3" fill="#1e293b" stroke="${frame.outer}" stroke-width="0.5"/>
  <text x="${CARD_W - 28}" y="168" text-anchor="middle" font-size="6" font-weight="700" fill="#F4C542" letter-spacing="0.08em">${profile.stage.toUpperCase()}</text>

  <text x="${cx}" y="180" text-anchor="middle" font-size="7.5" font-weight="800" fill="#f8fafc" letter-spacing="0.06em" filter="url(#text-shadow-${id})">${displayName}</text>
  <text x="${cx}" y="190" text-anchor="middle" font-size="5" fill="#94a3b8" letter-spacing="0.14em">${profile.mood.toUpperCase()} · ${profile.conviction}%</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const PREMIUM_CARD_ASPECT = CARD_H / CARD_W;