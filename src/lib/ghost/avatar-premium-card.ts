import type { GhostTraits } from "@/types/ghost";
import { WC_2026_NATIONS } from "@/lib/football/teams";
import {
  buildAvatarVisualProfile,
  seededRandom,
  type AvatarFacialHair,
  type AvatarHairStyle,
  type AvatarKitPattern,
  type AvatarKitWear,
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

export const CARD_W = 200;
export const CARD_H = 280;
const LAYOUT_K = CARD_W / 150;

function teamCode(team: string, teamCode?: string): string {
  if (teamCode) return teamCode;
  return WC_2026_NATIONS.find((n) => n.name === team)?.code ?? "UNK";
}

/** Mature male head — late 20s/early 30s, strong jaw, not oversized. */
function headPath(cx: number, headY: number, jaw: number): string {
  const j = jaw * 4.5;
  return `M ${cx - 9.5} ${headY}
    C ${cx - 10.5} ${headY - 8} ${cx - 6} ${headY - 15} ${cx} ${headY - 15.5}
    C ${cx + 6} ${headY - 15} ${cx + 10.5} ${headY - 8} ${cx + 9.5} ${headY}
    C ${cx + 9} ${headY + 5 + j} ${cx + 6} ${headY + 10 + j} ${cx} ${headY + 10.5 + j}
    C ${cx - 6} ${headY + 10 + j} ${cx - 9} ${headY + 5 + j} ${cx - 9.5} ${headY} Z`;
}

function renderStubble(
  cx: number,
  headY: number,
  style: AvatarFacialHair,
  op: number
): string {
  if (style === "clean") return "";
  const density = style === "match_stubble" ? 0.55 : 0.32;
  return `<g opacity="${(op * density).toFixed(2)}">
    ${Array.from({ length: style === "match_stubble" ? 14 : 8 }, (_, i) => {
      const x = cx - 7 + (i % 7) * 2.2;
      const y = headY + 4 + Math.floor(i / 7) * 2;
      return `<circle cx="${x.toFixed(1)}" cy="${y}" r="0.35" fill="#2a3444"/>`;
    }).join("")}
  </g>`;
}

function renderKitPattern(
  cx: number,
  shoulderY: number,
  waistY: number,
  pattern: AvatarKitPattern,
  palette: TeamPalette,
  op: number
): string {
  switch (pattern) {
    case "vertical_band":
      return `<rect x="${cx - 5}" y="${shoulderY + 4}" width="10" height="${waistY - shoulderY}" fill="${palette.primary}" opacity="${(op * 0.88).toFixed(2)}"/>`;
    case "diagonal_sash":
      return `<path d="M ${cx - 28} ${shoulderY + 6} L ${cx + 8} ${shoulderY + 6} L ${cx + 22} ${waistY + 2} L ${cx - 14} ${waistY + 2} Z" fill="${palette.primary}" opacity="${(op * 0.75).toFixed(2)}"/>`;
    case "split_blocks":
      return `<rect x="44" y="${shoulderY + 5}" width="28" height="${waistY - shoulderY - 2}" fill="${palette.primary}" opacity="${(op * 0.55).toFixed(2)}"/>
        <rect x="78" y="${shoulderY + 5}" width="28" height="${waistY - shoulderY - 2}" fill="${palette.accent}" opacity="${(op * 0.35).toFixed(2)}"/>`;
    default:
      return "";
  }
}

function renderBokeh(id: number, rand: () => number, accent: string): string {
  return Array.from({ length: 10 }, (_, i) => {
    const x = 8 + rand() * (CARD_W - 16);
    const y = 44 + rand() * 120;
    const r = 1.5 + rand() * 4;
    const fill = i % 3 === 0 ? accent : i % 3 === 1 ? "#F4C542" : "#fff";
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${fill}" opacity="${(0.04 + rand() * 0.1).toFixed(2)}" filter="url(#soft-${id})"/>`;
  }).join("");
}

function renderPesRating(
  cardW: number,
  conviction: number,
  tier: number,
  traitColor: string
): string {
  const ovr = Math.min(99, Math.round(62 + conviction * 0.28 + tier * 6));
  const x = cardW - 32;
  return `<g>
    <rect x="${x}" y="58" width="28" height="26" rx="5" fill="#0A1020" stroke="${traitColor}" stroke-width="1" opacity="0.94"/>
    <text x="${x + 14}" y="70" text-anchor="middle" font-size="5" fill="#94a3b8" font-weight="600">SPI</text>
    <text x="${x + 14}" y="82" text-anchor="middle" font-size="13" font-weight="800" fill="${traitColor}">${ovr}</text>
  </g>`;
}

function renderSpotlight(cx: number, cardH: number, id: number): string {
  return `<ellipse cx="${cx}" cy="${cardH * 0.28}" rx="${cx * 0.85}" ry="${cardH * 0.35}" fill="url(#spot-${id})" opacity="0.9"/>`;
}

function renderHair(
  cx: number,
  headY: number,
  style: AvatarHairStyle,
  op: number
): string {
  const fill = "#141c28";
  switch (style) {
    case "swept_back":
      return `<path d="M ${cx - 10} ${headY - 3} Q ${cx} ${headY - 18} ${cx + 10} ${headY - 3} L ${cx + 8} ${headY - 11} Q ${cx} ${headY - 15} ${cx - 8} ${headY - 11} Z" fill="${fill}" opacity="${op}"/>`;
    case "textured_crop":
      return `<path d="M ${cx - 10} ${headY - 2} Q ${cx - 6} ${headY - 15} ${cx} ${headY - 14} Q ${cx + 6} ${headY - 15} ${cx + 10} ${headY - 2} Z" fill="${fill}" opacity="${op}"/>
        <line x1="${cx - 6}" y1="${headY - 12}" x2="${cx - 4}" y2="${headY - 9}" stroke="#0f172a" stroke-width="0.6" opacity="0.35"/>
        <line x1="${cx + 2}" y1="${headY - 13}" x2="${cx + 4}" y2="${headY - 10}" stroke="#0f172a" stroke-width="0.6" opacity="0.35"/>`;
    case "side_part":
      return `<path d="M ${cx - 10} ${headY - 1} Q ${cx - 2} ${headY - 16} ${cx + 10} ${headY - 2} L ${cx + 7} ${headY - 10} Q ${cx - 1} ${headY - 13} ${cx - 9} ${headY - 8} Z" fill="${fill}" opacity="${op}"/>`;
    case "athletic_fade":
      return `<path d="M ${cx - 10} ${headY} Q ${cx - 8} ${headY - 14} ${cx} ${headY - 13} Q ${cx + 8} ${headY - 14} ${cx + 10} ${headY} L ${cx + 9} ${headY - 9} Q ${cx} ${headY - 12} ${cx - 9} ${headY - 9} Z" fill="${fill}" opacity="${op}"/>`;
    default:
      return `<path d="M ${cx - 10} ${headY - 1} Q ${cx} ${headY - 15} ${cx + 10} ${headY - 1} L ${cx + 9} ${headY - 10} Q ${cx} ${headY - 13} ${cx - 9} ${headY - 10} Z" fill="${fill}" opacity="${op}"/>`;
  }
}

function renderKitWear(
  cx: number,
  chestY: number,
  waistY: number,
  wear: AvatarKitWear,
  palette: TeamPalette
): string {
  if (wear === "pristine") return "";
  const streaks =
    wear === "battle_scarred"
      ? `<path d="M ${cx - 18} ${chestY + 8} L ${cx - 8} ${chestY + 18} L ${cx - 4} ${chestY + 12}" fill="#3f2e22" opacity="0.22"/>
         <path d="M ${cx + 20} ${chestY + 6} L ${cx + 10} ${waistY} L ${cx + 6} ${chestY + 14}" fill="#2a2018" opacity="0.18"/>
         <ellipse cx="${cx + 14}" cy="${chestY + 20}" rx="5" ry="2.5" fill="#1e293b" opacity="0.12"/>`
      : `<path d="M ${cx - 14} ${chestY + 10} L ${cx - 6} ${chestY + 16}" stroke="#4a3728" stroke-width="1.2" opacity="0.2"/>
         <path d="M ${cx + 12} ${chestY + 12} L ${cx + 6} ${waistY - 2}" stroke="#4a3728" stroke-width="1" opacity="0.16"/>`;
  return `${streaks}
    <path d="M ${cx - 20} ${chestY + 4} Q ${cx} ${chestY + 2} ${cx + 20} ${chestY + 4}" fill="none" stroke="${palette.primary}" stroke-width="0.5" opacity="0.08"/>`;
}

function renderMuscleLines(
  cx: number,
  shoulderY: number,
  chestY: number,
  definition: number,
  op: number
): string {
  if (definition < 0.45) return "";
  const a = (definition * 0.35).toFixed(2);
  return `<path d="M ${cx - 6} ${shoulderY + 14} Q ${cx - 2} ${chestY + 6} ${cx} ${chestY + 10}" fill="none" stroke="#0f172a" stroke-width="0.5" opacity="${a}"/>
    <path d="M ${cx + 6} ${shoulderY + 14} Q ${cx + 2} ${chestY + 6} ${cx} ${chestY + 10}" fill="none" stroke="#0f172a" stroke-width="0.5" opacity="${a}"/>`;
}

function renderPortraitLighting(cx: number, headY: number, id: number): string {
  return `<ellipse cx="${cx - 6}" cy="${headY - 4}" rx="5" ry="3.5" fill="#fff" opacity="0.09"/>
    <path d="M ${cx + 2} ${headY - 8} L ${cx + 4} ${headY + 2} L ${cx + 1} ${headY + 6}" fill="#000" opacity="0.08"/>
    <ellipse cx="${cx + 5}" cy="${headY + 2}" rx="2.5" ry="3.5" fill="#3d2f28" opacity="0.12"/>`;
}

function renderFace(
  cx: number,
  headY: number,
  moodKey: string,
  expressionStyle: string,
  eyeIntensity: number
): string {
  const smirk = /smirk|banter/i.test(expressionStyle);
  const steely = /defiant|steely|jaw/i.test(expressionStyle);
  const eyeW = 2 + eyeIntensity * 0.8;
  const eyeH = 1.3 + eyeIntensity * 0.5;
  const lighting = renderPortraitLighting(cx, headY, 0);

  if (steely || moodKey === "fierce") {
    return `${lighting}
      <path d="M ${cx - 9} ${headY - 0.5} L ${cx - 5} ${headY - 2.5}" stroke="#1a2030" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M ${cx + 5} ${headY - 2.5} L ${cx + 9} ${headY - 0.5}" stroke="#1a2030" stroke-width="1.4" stroke-linecap="round"/>
      <ellipse cx="${cx - 5}" cy="${headY + 1.5}" rx="${eyeW}" ry="${eyeH * 0.75}" fill="#0f172a"/>
      <ellipse cx="${cx + 5}" cy="${headY + 1.5}" rx="${eyeW}" ry="${eyeH * 0.75}" fill="#0f172a"/>
      <path d="M ${cx - 1} ${headY + 3} L ${cx} ${headY + 5.5} L ${cx + 1} ${headY + 3}" fill="#2a3444" opacity="0.35"/>
      <path d="M ${cx - 4} ${headY + 8} L ${cx + 4} ${headY + 8}" stroke="#1a2030" stroke-width="1.1" stroke-linecap="round"/>`;
  }
  if (moodKey === "charged") {
    return `${lighting}
      <ellipse cx="${cx - 5.5}" cy="${headY + 1.5}" rx="${eyeW + 0.3}" ry="${eyeH}" fill="#0f172a"/>
      <ellipse cx="${cx + 5.5}" cy="${headY + 1.5}" rx="${eyeW + 0.3}" ry="${eyeH}" fill="#0f172a"/>
      <circle cx="${cx - 4.2}" cy="${headY + 0.5}" r="0.9" fill="#fff" opacity="0.5"/>
      <circle cx="${cx + 6.2}" cy="${headY + 0.5}" r="0.9" fill="#fff" opacity="0.5"/>
      <path d="M ${cx - 1} ${headY + 3.5} L ${cx} ${headY + 6} L ${cx + 1} ${headY + 3.5}" fill="#2a3444" opacity="0.3"/>
      <path d="M ${cx - 4.5} ${headY + 8.5} Q ${cx} ${headY + (smirk ? 10 : 11)} ${cx + 4.5} ${headY + 8.5}" stroke="#1a2030" stroke-width="1" fill="none"/>`;
  }
  return `${lighting}
    <ellipse cx="${cx - 5.5}" cy="${headY + 1.5}" rx="${eyeW * 0.85}" ry="${eyeH * 0.9}" fill="#0f172a" opacity="0.94"/>
    <ellipse cx="${cx + 5.5}" cy="${headY + 1.5}" rx="${eyeW * 0.85}" ry="${eyeH * 0.9}" fill="#0f172a" opacity="0.94"/>
    <path d="M ${cx - 1} ${headY + 3} L ${cx} ${headY + 5} L ${cx + 1} ${headY + 3}" fill="#2a3444" opacity="0.28"/>
    <path d="M ${cx - 4} ${headY + 8} Q ${cx} ${headY + (smirk ? 7 : 6.5)} ${cx + 4} ${headY + 8}" stroke="#1a2030" stroke-width="0.9" fill="none"/>`;
}

function renderAthleticArm(
  side: "left" | "right",
  pose: string,
  cx: number,
  shoulderY: number,
  chestY: number,
  waistY: number,
  headY: number,
  id: number,
  op: number,
  lk: (v: number) => number
): string {
  const fill = `url(#limb-${id})`;
  const attach = cx + (side === "left" ? -lk(48) : lk(48));
  if (pose === "celebration" && side === "left") {
    return `<path d="M ${attach} ${shoulderY + lk(10)} C ${cx - lk(66)} ${shoulderY - lk(6)} ${cx - lk(78)} ${headY - lk(6)} ${cx - lk(80)} ${headY - lk(18)} C ${cx - lk(76)} ${headY - lk(24)} ${cx - lk(66)} ${headY - lk(14)} ${cx - lk(58)} ${shoulderY} Z" fill="${fill}" opacity="${op}"/>`;
  }
  if (pose === "celebration" && side === "right") {
    return `<path d="M ${attach} ${shoulderY + lk(10)} C ${cx + lk(66)} ${shoulderY - lk(6)} ${cx + lk(78)} ${headY - lk(6)} ${cx + lk(80)} ${headY - lk(18)} C ${cx + lk(76)} ${headY - lk(24)} ${cx + lk(66)} ${headY - lk(14)} ${cx + lk(58)} ${shoulderY} Z" fill="${fill}" opacity="${op}"/>`;
  }
  if (side === "left") {
    return `<path d="M ${attach} ${shoulderY + lk(12)} C ${cx - lk(60)} ${chestY + lk(8)} ${cx - lk(68)} ${waistY + lk(10)} ${cx - lk(62)} ${waistY + lk(20)} C ${cx - lk(56)} ${waistY + lk(14)} ${cx - lk(52)} ${chestY + lk(6)} ${cx - lk(46)} ${shoulderY + lk(8)} Z" fill="${fill}" opacity="${op}"/>`;
  }
  return `<path d="M ${attach} ${shoulderY + lk(12)} C ${cx + lk(60)} ${chestY + lk(6)} ${cx + lk(68)} ${waistY + lk(12)} ${cx + lk(62)} ${waistY + lk(22)} C ${cx + lk(56)} ${waistY + lk(16)} ${cx + lk(52)} ${chestY + lk(4)} ${cx + lk(46)} ${shoulderY + lk(8)} Z" fill="${fill}" opacity="${op}"/>`;
}

function frameStroke(tier: number): { outer: string; inner: string; width: number } {
  if (tier >= 4) return { outer: "#F4C542", inner: "#FFF3C4", width: 2.4 };
  if (tier >= 3) return { outer: "#D4AF37", inner: "#F4C542", width: 1.8 };
  if (tier >= 2) return { outer: "#B8C4D4", inner: "#E2E8F0", width: 1.4 };
  if (tier >= 1) return { outer: "#B87333", inner: "#CD7F32", width: 1.1 };
  return { outer: "#64748B", inner: "#475569", width: 0.9 };
}

function countMemories(memories: GhostMemorySnapshot[] | undefined, type: string): number {
  return (memories ?? []).filter((m) => m.type === type).length;
}

function interactionCounts(memories: GhostMemorySnapshot[] | undefined) {
  const m = memories ?? [];
  return {
    comments:
      countMemories(m, "social_comment") +
      countMemories(m, "legacy_comment") +
      countMemories(m, "news_comment"),
    reactions: countMemories(m, "social_reaction"),
    matches: countMemories(m, "match_reaction"),
    evolution: countMemories(m, "evolution_checkpoint"),
  };
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

/** Premium vertical player-card SVG — canonical GoalGhost visual across the platform. */
export function buildPremiumGhostCardDataUri(params: PremiumCardParams): string {
  const profile = buildAvatarVisualProfile({ ...params, identity: params.identity });
  const rand = seededRandom(profile.seed);
  const code = teamCode(params.team, params.teamCode);
  const palette = NATION_PALETTES[code] ?? DEFAULT_PALETTE;
  const accentGlow = ACCENT_GLOWS[profile.visualAccentKey] ?? palette.accent;
  const traitRim = TRAIT_RIM[profile.dominantTrait];
  const id = profile.seed;
  const kit = profile.kitDetailLevel;
  const bodyOp = profile.bodySolidity;
  const ghostVeilOpacity = Math.min(0.35, profile.ghostOpacity * 0.65);
  const lk = (v: number) => v * LAYOUT_K;
  const kitNumber = 7 + Math.floor(rand() * 9);
  const pose = profile.pose;
  const floatY = -profile.floatHeight * 0.85;
  const frame = frameStroke(profile.tier);
  const cx = CARD_W / 2;
  const counts = interactionCounts(params.memories);
  const intensityPct = Math.min(100, profile.interactionIntensity);

  const headY = lk(46) + floatY * 0.1;
  const neckY = headY + lk(13);
  const shoulderY = neckY + lk(7);
  const chestY = shoulderY + lk(22);
  const waistY = chestY + lk(17);
  const hipY = waistY + lk(14);

  const moodKey =
    profile.mood === "fierce" || profile.mood === "defiant"
      ? "fierce"
      : profile.mood === "euphoric" || profile.mood === "electric"
        ? "charged"
        : "focused";

  const lean = pose === "defiant" ? -4 : pose === "celebration" ? 3 : 5;
  const playerShellTransform = `translate(${lean} ${lk(2)}) rotate(${profile.portraitTilt.toFixed(1)} ${cx} ${chestY}) scale(${profile.presenceScale})`;
  const shoulderScale = profile.physiqueScale * profile.stanceWidth;

  const interactionBar = `<rect x="${lk(14)}" y="${lk(30)}" width="${lk(122)}" height="4" rx="2" fill="#1e293b" opacity="0.85"/>
    <rect x="${lk(14)}" y="${lk(30)}" width="${(intensityPct * lk(1.22)).toFixed(1)}" height="4" rx="2" fill="url(#intensity-${id})"/>
    <text x="${lk(14)}" y="${lk(27)}" font-size="5" fill="#64748b" letter-spacing="0.12em">JOURNEY ${intensityPct}%</text>`;

  const statRow = `<g opacity="0.9">
    <text x="${lk(16)}" y="${lk(42)}" font-size="5.5" fill="#94a3b8">${counts.comments}C</text>
    <text x="${lk(38)}" y="${lk(42)}" font-size="5.5" fill="#94a3b8">${counts.reactions}R</text>
    <text x="${lk(58)}" y="${lk(42)}" font-size="5.5" fill="#94a3b8">${counts.matches}M</text>
    <text x="${lk(78)}" y="${lk(42)}" font-size="5.5" fill="#F4C542">+${profile.totalEvolutionGain} EV</text>
  </g>`;

  const spotlight = renderSpotlight(cx, CARD_H, id);
  const stadiumLight = `<ellipse cx="${cx}" cy="${lk(95)}" rx="${lk(62)}" ry="${lk(78)}" fill="url(#burst-${id})"/>
    <ellipse cx="${cx}" cy="${lk(108)}" rx="${lk(46)}" ry="${lk(54)}" fill="url(#burst-core-${id})"/>`;

  const vignette = `<rect width="${CARD_W}" height="${CARD_H}" rx="16" fill="url(#vignette-${id})" opacity="0.55"/>`;

  const ghostFloor = `<ellipse cx="${cx}" cy="${hipY + 58}" rx="${40 + profile.tier * 4}" ry="${16 + profile.tier * 2}" fill="url(#ghost-floor-${id})" opacity="${(0.45 + profile.auraIntensity * 0.5).toFixed(2)}" filter="url(#soft-${id})"/>`;

  const wisps = Array.from(
    { length: 2 + Math.floor(intensityPct / 25) + profile.tier },
    (_, i) => {
      const x = 28 + rand() * 94;
      const h = 18 + rand() * 24;
      return `<path d="M ${x.toFixed(1)} ${hipY + 56} Q ${(x + (rand() - 0.5) * 10).toFixed(1)} ${hipY + 56 - h / 2} ${(x + (rand() - 0.5) * 6).toFixed(1)} ${hipY + 56 - h}" stroke="${accentGlow}" stroke-width="1.4" fill="none" opacity="${(0.12 + rand() * 0.2).toFixed(2)}" filter="url(#soft-${id})"/>`;
    }
  ).join("");

  const shoulderSpanEarly = lk(34) * shoulderScale;
  const edgeGlow = `<path d="M ${cx - shoulderSpanEarly} ${shoulderY} Q ${cx - shoulderSpanEarly - lk(4)} ${chestY} ${cx - shoulderSpanEarly - lk(2)} ${waistY + lk(22)}" fill="none" stroke="${accentGlow}" stroke-width="2.5" opacity="${(ghostVeilOpacity * 0.55).toFixed(2)}" filter="url(#ghost-edge-${id})"/>
    <path d="M ${cx + shoulderSpanEarly} ${shoulderY} Q ${cx + shoulderSpanEarly + lk(4)} ${chestY} ${cx + shoulderSpanEarly + lk(2)} ${waistY + lk(22)}" fill="none" stroke="${accentGlow}" stroke-width="2.5" opacity="${(ghostVeilOpacity * 0.55).toFixed(2)}" filter="url(#ghost-edge-${id})"/>`;

  const sparks =
    profile.hasReactionSparks || intensityPct >= 30
      ? Array.from({ length: 4 + Math.floor(intensityPct / 20) + profile.tier }, (_, i) => {
          const x = 14 + rand() * (CARD_W - 28);
          const y = 50 + rand() * 110;
          return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.5 + rand() * 1).toFixed(2)}" fill="${accentGlow}" opacity="0.5">
            <animate attributeName="opacity" values="0.15;0.75;0.15" dur="${(2.5 + rand() * 2).toFixed(1)}s" repeatCount="indefinite"/>
          </circle>`;
        }).join("")
      : "";

  const commentEnergy = profile.hasCommentEnergy
    ? `<path d="M 18 ${chestY} Q 24 ${chestY - 8} 20 ${chestY - 14}" stroke="${palette.accent}" stroke-width="0.8" fill="none" opacity="0.4"/>
       <path d="M 132 ${chestY + 4} Q 126 ${chestY - 4} 130 ${chestY - 10}" stroke="${palette.accent}" stroke-width="0.8" fill="none" opacity="0.4"/>`
    : "";

  const mediaGlow = profile.hasMediaGlow
    ? `<ellipse cx="${cx}" cy="${chestY + 6}" rx="22" ry="28" fill="${palette.primary}" opacity="0.06" filter="url(#soft-${id})"/>`
    : "";

  const skinBase = profile.skinTone;
  const neck = `<path d="M ${cx - 5.5} ${neckY} L ${cx - 8} ${shoulderY} L ${cx + 8} ${shoulderY} L ${cx + 5.5} ${neckY} Z" fill="url(#skin-${id})" opacity="${bodyOp}"/>`;

  const head = `<path d="${headPath(cx, headY, profile.jawIntensity)}" fill="url(#skin-${id})" opacity="${bodyOp}"/>
    <path d="M ${cx - 9} ${headY - 1} Q ${cx - 3} ${headY - 12} ${cx + 2} ${headY - 10}" fill="none" stroke="#fff" stroke-width="0.6" opacity="0.08"/>
    <ellipse cx="${cx - 5}" cy="${headY - 5}" rx="3.2" ry="2.2" fill="#fff" opacity="0.06"/>`;

  const hair = renderHair(cx, headY, profile.hairStyle, bodyOp * 0.98);
  const stubble = renderStubble(cx, headY, profile.facialHair, bodyOp);
  const face = renderFace(
    cx,
    headY,
    moodKey,
    profile.expressionStyle,
    profile.eyeIntensity
  );
  const kitPatternMark = renderKitPattern(
    cx,
    shoulderY,
    waistY,
    profile.kitPattern,
    palette,
    bodyOp
  );
  const bokeh = renderBokeh(id, rand, accentGlow);
  const pesRating = renderPesRating(
    CARD_W,
    profile.conviction,
    profile.tier,
    traitRim
  );
  const cardShine = `<path d="M 0 0 L ${CARD_W} 0 L 0 ${CARD_H}" fill="url(#shine-${id})" opacity="0.12"/>`;
  const muscleLines = renderMuscleLines(cx, shoulderY, chestY, profile.muscleDefinition, bodyOp);
  const kitWearMarks = renderKitWear(cx, chestY, waistY, profile.kitWear, palette);

  const ghostVeilOverlay = `<rect x="${cx - lk(42)}" y="${shoulderY - lk(6)}" width="${lk(84)}" height="${hipY + lk(58) - shoulderY + lk(6)}" fill="url(#ghost-veil-${id})" opacity="${(ghostVeilOpacity * 0.14).toFixed(2)}" pointer-events="none"/>`;

  const shoulderSpan = lk(34) * shoulderScale;
  const jersey = `<path d="M ${cx - shoulderSpan} ${shoulderY} Q ${cx} ${shoulderY - 6} ${cx + shoulderSpan} ${shoulderY} L ${cx + shoulderSpan + 6} ${chestY + 2} L ${cx + shoulderSpan - 2} ${waistY + 2} Q ${cx} ${waistY + 8} ${cx - shoulderSpan + 2} ${waistY + 2} L ${cx - shoulderSpan - 6} ${chestY + 2} Z" fill="url(#jersey-${id})" opacity="${bodyOp}"/>
    <path d="M 48 ${shoulderY + 4} L 102 ${shoulderY + 4} L 100 ${chestY - 2} L 50 ${chestY - 2} Z" fill="url(#jersey-light-${id})" opacity="${(bodyOp * 0.75).toFixed(2)}"/>
    <path d="M 46 ${shoulderY + 8} Q ${cx} ${chestY + 4} 104 ${shoulderY + 8}" fill="none" stroke="#000" stroke-width="0.4" opacity="0.2"/>
    <path d="M 38 ${shoulderY + 2} Q 42 ${shoulderY + 12} 44 ${chestY + 4}" fill="none" stroke="${palette.primary}" stroke-width="3.5" opacity="${(bodyOp * 0.9).toFixed(2)}" stroke-linecap="round"/>
    <path d="M 112 ${shoulderY + 2} Q 108 ${shoulderY + 12} 106 ${chestY + 4}" fill="none" stroke="${palette.primary}" stroke-width="3.5" opacity="${(bodyOp * 0.9).toFixed(2)}" stroke-linecap="round"/>`;

  const kitStripe =
    kit >= 2
      ? `<rect x="72" y="${shoulderY + 5}" width="7" height="${waistY - shoulderY}" fill="${palette.primary}" opacity="0.92"/>
         <rect x="48" y="${shoulderY + 5}" width="3" height="${waistY - shoulderY}" fill="${palette.accent}" opacity="0.35"/>`
      : "";

  const kitFolds =
    kit >= 3
      ? `<path d="M 54 ${chestY + 6} Q ${cx} ${chestY + 10} 96 ${chestY + 6}" fill="none" stroke="#000" stroke-width="0.5" opacity="0.15"/>
         <path d="M 52 ${waistY - 4} Q ${cx} ${waistY} 98 ${waistY - 4}" fill="none" stroke="#000" stroke-width="0.4" opacity="0.12"/>`
      : "";

  const crest =
    kit >= 2
      ? `<circle cx="${cx}" cy="${shoulderY + 18}" r="8" fill="url(#crest-${id})" stroke="${palette.accent}" stroke-width="0.7"/>
         <text x="${cx}" y="${shoulderY + 20.5}" text-anchor="middle" font-size="6" font-weight="800" fill="${palette.secondary}">${code}</text>`
      : "";

  const kitNum =
    kit >= 3
      ? `<text x="${cx}" y="${waistY - 2}" text-anchor="middle" font-size="16" font-weight="800" fill="${palette.accent}" opacity="0.96" filter="url(#text-shadow-${id})">${kitNumber}</text>`
      : "";

  const collar = `<path d="M ${cx - 8} ${neckY + 1} Q ${cx} ${neckY + 7} ${cx + 8} ${neckY + 1}" fill="none" stroke="${palette.accent}" stroke-width="1.6" opacity="0.9"/>`;

  const captainBand = profile.hasCaptainBand
    ? `<rect x="${cx + lk(44)}" y="${shoulderY + lk(10)}" width="${lk(14)}" height="${lk(5.5)}" rx="1.2" fill="${profile.hasLegendHalo ? "#F4C542" : palette.accent}" stroke="#0f172a" stroke-width="0.4"/>
       <text x="${cx + lk(51)}" y="${shoulderY + lk(14)}" text-anchor="middle" font-size="5" font-weight="800" fill="#0f172a">C</text>`
    : "";

  const scarf = profile.hasScarf
    ? `<path d="M ${cx - lk(58)} ${shoulderY - 2} Q ${cx} ${shoulderY + lk(10)} ${cx + lk(58)} ${shoulderY - 2} L ${cx + lk(54)} ${waistY + lk(6)} Q ${cx} ${waistY} ${cx - lk(54)} ${waistY + lk(6)} Z" fill="${palette.primary}" opacity="0.55"/>`
    : "";

  const goldTrim =
    kit >= 5 || profile.hasLegendHalo
      ? `<path d="M ${cx - shoulderSpan} ${shoulderY} L ${cx + shoulderSpan} ${shoulderY}" stroke="#F4C542" stroke-width="1.4" opacity="0.85"/>
         <path d="M ${cx - shoulderSpan + lk(2)} ${waistY + 2} L ${cx + shoulderSpan - lk(2)} ${waistY + 2}" stroke="#F4C542" stroke-width="0.7" opacity="0.55"/>`
      : "";

  const leftArm = renderAthleticArm(
    "left",
    pose,
    cx,
    shoulderY,
    chestY,
    waistY,
    headY,
    id,
    bodyOp,
    lk
  );
  const rightArm = renderAthleticArm(
    "right",
    pose,
    cx,
    shoulderY,
    chestY,
    waistY,
    headY,
    id,
    bodyOp,
    lk
  );

  const shorts = `<path d="M ${cx - lk(54)} ${waistY + 2} L ${cx + lk(54)} ${waistY + 2} L ${cx + lk(50)} ${hipY + lk(10)} Q ${cx} ${hipY + lk(18)} ${cx - lk(50)} ${hipY + lk(10)} Z" fill="${palette.secondary}" opacity="${(bodyOp * 0.98).toFixed(2)}"/>
    <path d="M ${cx - lk(50)} ${waistY + lk(8)} L ${cx + lk(50)} ${waistY + lk(8)} L ${cx + lk(48)} ${hipY + lk(4)} L ${cx - lk(48)} ${hipY + lk(4)} Z" fill="#000" opacity="0.08"/>`;

  const leftLeg =
    pose === "match_ready" || pose === "clutch_ball"
      ? `<path d="M ${cx - lk(46)} ${hipY + lk(10)} L ${cx - lk(54)} ${hipY + lk(36)} L ${cx - lk(58)} ${hipY + lk(52)} L ${cx - lk(44)} ${hipY + lk(50)} L ${cx - lk(38)} ${hipY + lk(28)} Z" fill="url(#limb-${id})" opacity="${bodyOp}"/>`
      : `<path d="M ${cx - lk(44)} ${hipY + lk(10)} L ${cx - lk(48)} ${hipY + lk(36)} L ${cx - lk(52)} ${hipY + lk(52)} L ${cx - lk(40)} ${hipY + lk(50)} L ${cx - lk(36)} ${hipY + lk(28)} Z" fill="url(#limb-${id})" opacity="${bodyOp}"/>`;

  const rightLeg = `<path d="M ${cx + lk(44)} ${hipY + lk(10)} L ${cx + lk(50)} ${hipY + lk(34)} L ${cx + lk(54)} ${hipY + lk(52)} L ${cx + lk(40)} ${hipY + lk(50)} L ${cx + lk(36)} ${hipY + lk(28)} Z" fill="url(#limb-${id})" opacity="${bodyOp}"/>`;

  const leftSock = `<rect x="${cx - lk(56)}" y="${hipY + lk(32)}" width="${lk(14)}" height="${lk(16)}" rx="1.2" fill="${palette.primary}" opacity="0.94"/>`;
  const rightSock = `<rect x="${cx + lk(42)}" y="${hipY + lk(30)}" width="${lk(14)}" height="${lk(16)}" rx="1.2" fill="${palette.primary}" opacity="0.94"/>`;

  const bootStuds = (bx: number, by: number) =>
    Array.from({ length: 5 }, (_, i) => {
      const sx = bx - 8 + i * 4;
      return `<circle cx="${sx}" cy="${by + 2}" r="0.7" fill="#334155"/>`;
    }).join("");

  const leftBootX = cx - lk(51);
  const rightBootX = cx + lk(49);
  const bootY = hipY + lk(50);
  const leftBoot = `<path d="M ${leftBootX - lk(12)} ${bootY} L ${leftBootX + lk(10)} ${bootY} L ${leftBootX + lk(12)} ${bootY + lk(8)} L ${leftBootX - lk(14)} ${bootY + lk(8)} Z" fill="url(#boot-${id})"/>
    <ellipse cx="${leftBootX}" cy="${bootY + lk(9)}" rx="${lk(12)}" ry="4" fill="#020617"/>
    ${bootStuds(leftBootX, bootY + lk(8))}`;
  const rightBoot = `<path d="M ${rightBootX - lk(12)} ${bootY} L ${rightBootX + lk(10)} ${bootY} L ${rightBootX + lk(12)} ${bootY + lk(8)} L ${rightBootX - lk(14)} ${bootY + lk(8)} Z" fill="url(#boot-${id})"/>
    <ellipse cx="${rightBootX}" cy="${bootY + lk(9)}" rx="${lk(12)}" ry="4" fill="#020617"/>
    ${bootStuds(rightBootX, bootY + lk(8))}`;

  const celebrationBurst =
    pose === "celebration" && profile.celebrationEnergy >= 0.35
      ? `<g opacity="${(0.35 + profile.celebrationEnergy * 0.45).toFixed(2)}">
          <path d="M ${cx - 30} ${headY - 20} L ${cx - 26} ${headY - 28} L ${cx - 22} ${headY - 20}" fill="${accentGlow}"/>
          <path d="M ${cx + 30} ${headY - 18} L ${cx + 34} ${headY - 26} L ${cx + 38} ${headY - 18}" fill="${palette.primary}"/>
          <circle cx="${cx}" cy="${headY - 24}" r="2" fill="#F4C542"/>
        </g>`
      : "";

  const showBall = pose === "clutch_ball" || pose === "celebration";
  const ballX = pose === "clutch_ball" ? cx + lk(38) : cx + lk(24);
  const ballY = hipY + lk(42);
  const football = showBall
    ? `<g class="gg-ball" data-animate="bob">
    <circle cx="${ballX}" cy="${ballY + 1}" r="10" fill="#000" opacity="0.2" filter="url(#soft-${id})"/>
    <circle cx="${ballX}" cy="${ballY}" r="9.5" fill="url(#ball-${id})"/>
    <path d="M ${ballX} ${ballY - 6.5} L ${ballX + 2.5} ${ballY - 2.2} L ${ballX + 6.5} ${ballY - 2.2} L ${ballX + 3} ${ballY + 1.8} L ${ballX + 4.2} ${ballY + 6} L ${ballX} ${ballY + 3.8} L ${ballX - 4.2} ${ballY + 6} L ${ballX - 3} ${ballY + 1.8} L ${ballX - 6.5} ${ballY - 2.2} L ${ballX - 2.5} ${ballY - 2.2} Z" fill="#1e293b" opacity="0.25"/>
    <ellipse cx="${ballX - 2.5}" cy="${ballY - 2}" rx="2.5" ry="1.5" fill="#fff" opacity="0.4"/>
    <animateTransform attributeName="transform" type="translate" values="0,0; 0,-2; 0,0" dur="3.2s" repeatCount="indefinite"/>
  </g>`
    : "";

  const legendHalo = profile.hasLegendHalo
    ? `<ellipse cx="${cx}" cy="${headY + 6}" rx="42" ry="48" fill="none" stroke="#F4C542" stroke-width="1.2" opacity="0.4"/>
       <ellipse cx="${cx}" cy="${headY + 6}" rx="46" ry="52" fill="none" stroke="#F4C542" stroke-width="0.5" opacity="0.2"/>`
    : "";

  const holoFoil =
    profile.tier >= 3
      ? `<rect x="10" y="44" width="130" height="148" fill="url(#holo-${id})" opacity="0.07"/>`
      : "";

  const displayName = (
    params.name.length > 16 ? `${params.name.slice(0, 14)}…` : params.name
  ).toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD_W} ${CARD_H}" role="img" aria-label="${params.name} football spirit card">
  <defs>
    <linearGradient id="bg-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#121a2e"/>
      <stop offset="40%" stop-color="#0A1020"/>
      <stop offset="100%" stop-color="#0c1812"/>
    </linearGradient>
    <radialGradient id="burst-${id}" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="${traitRim}" stop-opacity="0.32"/>
      <stop offset="60%" stop-color="${palette.secondary}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="burst-core-${id}" cx="50%" cy="38%" r="55%">
      <stop offset="0%" stop-color="${accentGlow}" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <radialGradient id="vignette-${id}" cx="50%" cy="50%" r="75%">
      <stop offset="55%" stop-color="transparent"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.65"/>
    </radialGradient>
    <linearGradient id="jersey-${id}" x1="0.15" y1="0" x2="0.95" y2="1">
      <stop offset="0%" stop-color="${palette.secondary}"/>
      <stop offset="45%" stop-color="${palette.secondary}"/>
      <stop offset="100%" stop-color="${palette.primary}"/>
    </linearGradient>
    <linearGradient id="jersey-light-${id}" x1="0.5" y1="0" x2="0.5" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.18"/>
    </linearGradient>
    <linearGradient id="skin-${id}" x1="0.35" y1="0" x2="0.65" y2="1">
      <stop offset="0%" stop-color="${skinBase}"/>
      <stop offset="55%" stop-color="${skinBase}"/>
      <stop offset="100%" stop-color="#6b5d52"/>
    </linearGradient>
    <linearGradient id="ghost-veil-${id}" x1="0" y1="0.5" x2="1" y2="0.5">
      <stop offset="0%" stop-color="${accentGlow}" stop-opacity="0.35"/>
      <stop offset="50%" stop-color="#fff" stop-opacity="0.08"/>
      <stop offset="100%" stop-color="${accentGlow}" stop-opacity="0.35"/>
    </linearGradient>
    <linearGradient id="limb-${id}" x1="0.4" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="#d8e0ea"/>
      <stop offset="100%" stop-color="#7b8a9c"/>
    </linearGradient>
    <radialGradient id="crest-${id}" cx="38%" cy="32%" r="68%">
      <stop offset="0%" stop-color="#fff"/>
      <stop offset="100%" stop-color="${palette.accent}"/>
    </radialGradient>
    <radialGradient id="ball-${id}" cx="32%" cy="26%" r="72%">
      <stop offset="0%" stop-color="#fff"/>
      <stop offset="100%" stop-color="#b8c4d0"/>
    </radialGradient>
    <radialGradient id="ghost-floor-${id}" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accentGlow}"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <linearGradient id="intensity-${id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="${traitRim}"/>
      <stop offset="100%" stop-color="${accentGlow}"/>
    </linearGradient>
    <linearGradient id="holo-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#9945FF" stop-opacity="0.5"/>
      <stop offset="50%" stop-color="#14F195" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#F4C542" stop-opacity="0.45"/>
    </linearGradient>
    <linearGradient id="plate-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a2438"/>
      <stop offset="100%" stop-color="#0A1020"/>
    </linearGradient>
    <linearGradient id="shine-${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="spot-${id}" cx="50%" cy="0%" r="85%">
      <stop offset="0%" stop-color="#fff" stop-opacity="0.22"/>
      <stop offset="45%" stop-color="#fff" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <linearGradient id="boot-${id}" x1="0.3" y1="0" x2="0.7" y2="1">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <pattern id="mesh-${id}" width="4" height="4" patternUnits="userSpaceOnUse">
      <path d="M 0 4 L 4 0" stroke="#fff" stroke-width="0.25" opacity="0.06"/>
    </pattern>
    <filter id="card-shadow-${id}">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000" flood-opacity="0.6"/>
    </filter>
    <filter id="ghost-edge-${id}">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="soft-${id}"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="text-shadow-${id}">
      <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#000" flood-opacity="0.55"/>
    </filter>
    <filter id="player-depth-${id}">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>

  <rect width="${CARD_W}" height="${CARD_H}" rx="16" fill="url(#bg-${id})" filter="url(#card-shadow-${id})"/>
  ${spotlight}
  ${stadiumLight}
  ${bokeh}
  ${holoFoil}
  ${cardShine}
  ${vignette}
  ${pesRating}

  <rect x="6" y="6" width="${CARD_W - 12}" height="${CARD_H - 12}" rx="13" fill="none" stroke="${frame.outer}" stroke-width="${frame.width}"/>
  <rect x="9" y="9" width="${CARD_W - 18}" height="${CARD_H - 18}" rx="11" fill="none" stroke="${frame.inner}" stroke-width="0.6" opacity="0.55"/>

  <text x="14" y="18" font-size="5" fill="#64748b" font-weight="600" letter-spacing="0.2em">GOALGHOST SPIRIT</text>
  <text x="${CARD_W - 14}" y="18" text-anchor="end" font-size="5.5" fill="${traitRim}" font-weight="700">${profile.dominantTrait.toUpperCase()}</text>

  ${interactionBar}
  ${statRow}
  ${sparks}
  ${ghostFloor}
  ${wisps}
  ${legendHalo}
  ${celebrationBurst}
  ${mediaGlow}
  ${commentEnergy}

  <g class="gg-player" data-animate="float" transform="${playerShellTransform}" filter="url(#player-depth-${id})">
    <g>
    <animateTransform attributeName="transform" type="translate" values="0,${floatY}; 0,${floatY - 3}; 0,${floatY}" dur="5.5s" repeatCount="indefinite"/>
    ${leftBoot}
    ${rightBoot}
    ${leftSock}
    ${rightSock}
    ${leftLeg}
    ${rightLeg}
    ${shorts}
    ${scarf}
    ${jersey}
    <rect x="40" y="${shoulderY + 2}" width="70" height="${waistY - shoulderY + 4}" fill="url(#mesh-${id})" opacity="${(bodyOp * 0.5).toFixed(2)}"/>
    ${kitPatternMark}
    ${kitWearMarks}
    ${kitStripe}
    ${kitFolds}
    ${muscleLines}
    ${collar}
    ${crest}
    ${kitNum}
    ${goldTrim}
    ${captainBand}
    ${leftArm}
    ${rightArm}
    ${neck}
    ${head}
    ${hair}
    ${face}
    ${stubble}
    ${edgeGlow}
    ${ghostVeilOverlay}
    </g>
  </g>
  ${football}

  <rect x="0" y="${lk(168)}" width="${CARD_W}" height="${lk(42)}" fill="url(#plate-${id})"/>
  <line x1="0" y1="${lk(168)}" x2="${CARD_W}" y2="${lk(168)}" stroke="${frame.outer}" stroke-width="0.8" opacity="0.45"/>

  <rect x="${lk(12)}" y="${lk(174)}" width="${lk(40)}" height="${lk(16)}" rx="5" fill="${palette.secondary}" opacity="0.9"/>
  <text x="${lk(32)}" y="${lk(185)}" text-anchor="middle" font-size="9" font-weight="800" fill="${palette.primary}">${code}</text>

  <rect x="${CARD_W - lk(52)}" y="${lk(174)}" width="${lk(40)}" height="${lk(16)}" rx="5" fill="#1e293b" stroke="${frame.outer}" stroke-width="0.5"/>
  <text x="${CARD_W - lk(32)}" y="${lk(185)}" text-anchor="middle" font-size="7.5" font-weight="700" fill="#F4C542">${profile.stage.toUpperCase()}</text>

  <text x="${cx}" y="${lk(198)}" text-anchor="middle" font-size="9" font-weight="800" fill="#f8fafc" letter-spacing="0.05em" filter="url(#text-shadow-${id})">${displayName}</text>
  <text x="${cx}" y="${lk(206)}" text-anchor="middle" font-size="5.5" fill="#94a3b8" letter-spacing="0.12em">${profile.mood.toUpperCase()} · ${profile.conviction}% · T${profile.tier}</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export const PREMIUM_CARD_ASPECT = CARD_H / CARD_W;