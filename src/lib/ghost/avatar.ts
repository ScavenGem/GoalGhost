import type { GhostTraits } from "@/types/ghost";
import { WC_2026_NATIONS } from "@/lib/football/teams";
import { ghostEvolutionStage } from "@/lib/ghost/avatar-prompt";

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

const TRAIT_EXPRESSION: Record<keyof GhostTraits, { eyes: string; aura: string }> = {
  passion: { eyes: "wide", aura: "flame" },
  loyalty: { eyes: "steady", aura: "shield" },
  drama: { eyes: "star", aura: "spotlight" },
  hope: { eyes: "bright", aura: "glow" },
  resilience: { eyes: "focused", aura: "steel" },
};

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function teamCodeFromName(team: string, teamCode?: string): string {
  if (teamCode) return teamCode;
  return WC_2026_NATIONS.find((n) => n.name === team)?.code ?? "UNK";
}

function dominantTrait(traits: GhostTraits): keyof GhostTraits {
  return Object.entries(traits).sort((a, b) => b[1] - a[1])[0][0] as keyof GhostTraits;
}

function evolutionTier(score: number): number {
  if (score >= 80) return 4;
  if (score >= 50) return 3;
  if (score >= 25) return 2;
  if (score > 0) return 1;
  return 0;
}

function memoryVisuals(summary: string) {
  const s = summary.toLowerCase();
  return {
    celebratory: /win|victory|goal|comeback|celebrat|thrill|euphor|champion/.test(s),
    determined: /loss|defeat|tough|heartbreak|fight|resilien|grit|battle/.test(s),
    rival: /rival|derby|clasico|enemy|hatred/.test(s),
  };
}

function moodExpression(mood: string) {
  if (["fervent", "charged", "electric"].includes(mood)) {
    return { eyeY: 36, eyeRx: 5.5, eyeRy: 6.5, mouth: "M 41 50 Q 50 57 59 50" };
  }
  if (["reflective", "devoted", "calm"].includes(mood)) {
    return { eyeY: 38, eyeRx: 4, eyeRy: 4.5, mouth: "M 44 51 Q 50 48 56 51" };
  }
  if (["defiant", "fierce"].includes(mood)) {
    return { eyeY: 37, eyeRx: 4.5, eyeRy: 5, mouth: "M 43 52 L 57 52" };
  }
  return { eyeY: 37, eyeRx: 4.5, eyeRy: 5.5, mouth: "M 42 50 Q 50 54 58 50" };
}

export function buildGhostAvatarDataUri(params: {
  team: string;
  teamCode?: string;
  traits?: GhostTraits;
  mood?: string;
  name: string;
  evolutionScore?: number;
  memorySummary?: string;
}): string {
  const traits = params.traits ?? {
    passion: 70,
    loyalty: 70,
    drama: 50,
    hope: 70,
    resilience: 65,
  };
  const mood = params.mood ?? "electric";
  const evolutionScore = params.evolutionScore ?? 0;
  const tier = evolutionTier(evolutionScore);
  const stage = ghostEvolutionStage(evolutionScore);
  const memories = memoryVisuals(params.memorySummary ?? "");
  const seed = hashSeed(
    `${params.name}|${params.team}|${mood}|${stage}|${params.memorySummary ?? ""}|${JSON.stringify(traits)}`
  );
  const rand = seeded(seed);
  const code = teamCodeFromName(params.team, params.teamCode);
  const palette = NATION_PALETTES[code] ?? DEFAULT_PALETTE;
  const trait = dominantTrait(traits);
  const expr = TRAIT_EXPRESSION[trait];
  const face = moodExpression(mood);

  const ghostTilt = (rand() - 0.5) * 6;
  const jerseyVariant = Math.floor(rand() * 3);
  const floatOffset = tier >= 2 ? 2 : 0;
  const bodyOpacity = tier === 0 ? 0.78 : tier === 1 ? 0.86 : 0.92;
  const glowStrength = 0.06 + tier * 0.05 + (memories.celebratory ? 0.06 : 0);

  const hasScarf = tier >= 3 && (traits.passion >= 70 || memories.celebratory);
  const hasCaptainBand = tier >= 4 || (tier >= 3 && traits.loyalty >= 80);
  const hasHeadband = tier >= 2 && (traits.resilience >= 72 || memories.determined);
  const hasGoldenAura = tier >= 4;
  const armsUp = memories.celebratory || (mood === "fervent" && tier >= 2);
  const clutchBall = !armsUp && tier >= 2;

  const stadiumLights =
    tier >= 1
      ? Array.from({ length: 5 }, (_, i) => {
          const x = 10 + i * 20;
          return `<circle cx="${x}" cy="6" r="2" fill="${palette.accent}" opacity="${0.35 + rand() * 0.45}" />`;
        }).join("")
      : "";

  const wisps = Array.from({ length: tier >= 2 ? 4 : 2 }, (_, i) => {
    const x = 28 + rand() * 44;
    const h = 10 + rand() * (tier >= 3 ? 20 : 12);
    return `<path d="M ${x} 88 Q ${x + (rand() - 0.5) * 8} ${88 - h / 2} ${x + (rand() - 0.5) * 5} ${88 - h}" fill="${palette.primary}" opacity="${0.2 + rand() * 0.3}" />`;
  }).join("");

  const jersey =
    jerseyVariant === 0
      ? `<rect x="34" y="52" width="32" height="26" rx="5" fill="${palette.secondary}" opacity="0.95"/>
         <rect x="34" y="52" width="32" height="9" fill="${palette.primary}" opacity="0.95"/>`
      : jerseyVariant === 1
        ? `<rect x="34" y="52" width="32" height="26" rx="5" fill="${palette.primary}" opacity="0.9"/>
           <rect x="46" y="52" width="8" height="26" fill="${palette.secondary}" opacity="0.92"/>`
        : `<rect x="34" y="52" width="32" height="26" rx="5" fill="${palette.secondary}" opacity="0.92"/>
           <path d="M 34 64 H 66" stroke="${palette.primary}" stroke-width="3.5" opacity="0.95"/>`;

  const kitNumber =
    tier >= 3
      ? `<text x="50" y="70" text-anchor="middle" font-size="8" font-weight="bold" fill="${palette.accent}" opacity="0.9">${7 + Math.floor(rand() * 9)}</text>`
      : "";

  const nationBadge =
    tier >= 2
      ? `<circle cx="50" cy="58" r="4.5" fill="${palette.accent}" opacity="0.85"/>
         <text x="50" y="59.5" text-anchor="middle" font-size="4.5" fill="${palette.secondary}" font-weight="bold">${code.slice(0, 2)}</text>`
      : "";

  const scarf = hasScarf
    ? `<path d="M 36 50 Q 50 58 64 50 L 62 72 Q 50 66 38 72 Z" fill="${palette.primary}" opacity="0.8"/>
       <path d="M 38 72 L 34 82 M 62 72 L 66 80" stroke="${palette.secondary}" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>`
    : "";

  const captainBand = hasCaptainBand
    ? `<rect x="56" y="54" width="12" height="4.5" rx="1" fill="${hasGoldenAura ? "#F4C542" : palette.accent}" opacity="0.95"/>
       <text x="62" y="57.5" text-anchor="middle" font-size="3.5" fill="#0A1020" font-weight="bold">C</text>`
    : "";

  const headband = hasHeadband
    ? `<rect x="36" y="${28 + floatOffset}" width="28" height="3.5" rx="1.5" fill="${palette.primary}" opacity="0.92"/>`
    : "";

  const leftArm = armsUp
    ? `<path d="M 34 56 Q 22 48 18 36" stroke="#E8EEF4" stroke-width="7" stroke-linecap="round" fill="none" opacity="${bodyOpacity}"/>
       <circle cx="18" cy="36" r="4" fill="#E8EEF4" opacity="${bodyOpacity}"/>`
    : clutchBall
      ? `<path d="M 34 58 Q 24 62 20 70" stroke="#E8EEF4" stroke-width="6.5" stroke-linecap="round" fill="none" opacity="${bodyOpacity}"/>`
      : `<path d="M 34 58 Q 26 66 24 74" stroke="#E8EEF4" stroke-width="6" stroke-linecap="round" fill="none" opacity="${bodyOpacity}"/>`;

  const rightArm = armsUp
    ? `<path d="M 66 56 Q 78 48 82 36" stroke="#E8EEF4" stroke-width="7" stroke-linecap="round" fill="none" opacity="${bodyOpacity}"/>
       <circle cx="82" cy="36" r="4" fill="#E8EEF4" opacity="${bodyOpacity}"/>`
    : clutchBall
      ? `<path d="M 66 58 Q 74 64 78 68" stroke="#E8EEF4" stroke-width="6.5" stroke-linecap="round" fill="none" opacity="${bodyOpacity}"/>`
      : `<path d="M 66 58 Q 74 66 76 74" stroke="#E8EEF4" stroke-width="6" stroke-linecap="round" fill="none" opacity="${bodyOpacity}"/>`;

  const legs =
    tier >= 1
      ? `<rect x="40" y="76" width="8" height="14" rx="3" fill="#E8EEF4" opacity="${bodyOpacity * 0.9}"/>
         <rect x="52" y="76" width="8" height="14" rx="3" fill="#E8EEF4" opacity="${bodyOpacity * 0.9}"/>
         <ellipse cx="44" cy="92" rx="6.5" ry="3.5" fill="${palette.secondary}" opacity="0.9"/>
         <ellipse cx="56" cy="92" rx="6.5" ry="3.5" fill="${palette.secondary}" opacity="0.9"/>
         <rect x="38" y="88" width="12" height="5" rx="2" fill="${palette.primary}" opacity="0.92"/>
         <rect x="50" y="88" width="12" height="5" rx="2" fill="${palette.primary}" opacity="0.92"/>`
      : `<path d="M 42 78 Q 50 90 58 78" fill="#E8EEF4" opacity="0.55"/>`;

  const headY = tier === 0 ? 38 : 36 + floatOffset;
  const headShape =
    tier === 0
      ? `<ellipse cx="50" cy="${headY}" rx="16" ry="17" fill="#E8EEF4" opacity="0.75"/>`
      : `<ellipse cx="50" cy="${headY}" rx="15" ry="16" fill="#E8EEF4" opacity="${bodyOpacity}"/>
         <ellipse cx="50" cy="${headY - 6}" rx="11" ry="7" fill="#FFFFFF" opacity="0.28"/>`;

  const eyeY = (expr.eyes === "wide" ? face.eyeY - 1 : face.eyeY) + (tier === 0 ? 0 : floatOffset);
  const eyeRx = expr.eyes === "wide" ? face.eyeRx + 1 : face.eyeRx;
  const eyeRy = expr.eyes === "wide" ? face.eyeRy + 1 : face.eyeRy;

  const eyes =
    tier >= 1
      ? `<ellipse cx="43" cy="${eyeY}" rx="${eyeRx}" ry="${eyeRy}" fill="#0A1020"/>
         <ellipse cx="57" cy="${eyeY}" rx="${eyeRx}" ry="${eyeRy}" fill="#0A1020"/>
         ${expr.eyes === "star" ? `<circle cx="43" cy="${eyeY - 1}" r="1.2" fill="#F4C542"/><circle cx="57" cy="${eyeY - 1}" r="1.2" fill="#F4C542"/>` : ""}
         ${memories.rival ? `<path d="M 41 ${eyeY + 2} L 45 ${eyeY}" stroke="#0A1020" stroke-width="1"/><path d="M 55 ${eyeY} L 59 ${eyeY + 2}" stroke="#0A1020" stroke-width="1"/>` : ""}
         <path d="${face.mouth}" stroke="#0A1020" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
      : `<circle cx="46" cy="${headY}" r="2" fill="#0A1020" opacity="0.5"/><circle cx="54" cy="${headY}" r="2" fill="#0A1020" opacity="0.5"/>`;

  const football = clutchBall
    ? `<circle cx="78" cy="70" r="7" fill="#FFFFFF" opacity="0.12"/>
       <circle cx="78" cy="70" r="7" fill="none" stroke="#FFFFFF" opacity="0.25" stroke-width="0.6"/>
       <path d="M 78 63 L 80 67 L 84 67 L 81 70 L 82 74 L 78 72 L 74 74 L 75 70 L 72 67 L 76 67 Z" fill="#FFFFFF" opacity="0.35"/>`
    : `<circle cx="12" cy="96" r="5.5" fill="#FFFFFF" opacity="0.08"/>
       <circle cx="12" cy="96" r="5.5" fill="none" stroke="#FFFFFF" opacity="0.14" stroke-width="0.5"/>`;

  const confetti = memories.celebratory && tier >= 2
    ? Array.from({ length: 6 }, (_, i) => {
        const x = 15 + rand() * 70;
        const y = 8 + rand() * 25;
        const c = i % 2 === 0 ? palette.primary : palette.accent;
        return `<rect x="${x}" y="${y}" width="2" height="2" fill="${c}" opacity="0.55" transform="rotate(${rand() * 90} ${x} ${y})"/>`;
      }).join("")
    : "";

  const aura =
    expr.aura === "flame"
      ? `<ellipse cx="50" cy="58" rx="36" ry="40" fill="url(#aura-${seed})" opacity="${glowStrength + 0.2}"/>`
      : expr.aura === "spotlight"
        ? `<ellipse cx="50" cy="32" rx="30" ry="14" fill="${palette.primary}" opacity="0.14"/>`
        : `<ellipse cx="50" cy="55" rx="34" ry="38" fill="${palette.primary}" opacity="${glowStrength}"/>`;

  const legendRing = hasGoldenAura
    ? `<circle cx="50" cy="52" r="42" fill="none" stroke="#F4C542" stroke-width="1.2" opacity="0.35"/>
       <circle cx="50" cy="52" r="44" fill="none" stroke="#F4C542" stroke-width="0.5" opacity="0.2"/>`
    : "";

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 110" role="img">
  <defs>
    <linearGradient id="pitch-${seed}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0A1020"/>
      <stop offset="100%" stop-color="#12243a"/>
    </linearGradient>
    <radialGradient id="aura-${seed}" cx="50%" cy="75%" r="65%">
      <stop offset="0%" stop-color="${palette.primary}"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <filter id="glow-${seed}">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="100" height="110" rx="18" fill="url(#pitch-${seed})"/>
  ${stadiumLights}
  <rect x="0" y="86" width="100" height="24" fill="#1a3d2a" opacity="0.55"/>
  <line x1="0" y1="86" x2="100" y2="86" stroke="${palette.primary}" stroke-width="0.5" opacity="0.35"/>
  ${confetti}
  ${legendRing}
  ${aura}
  <g transform="rotate(${ghostTilt.toFixed(1)} 50 52)" filter="url(#glow-${seed})">
    ${scarf}
    ${wisps}
    ${legs}
    ${leftArm}
    ${rightArm}
    ${jersey}
    ${nationBadge}
    ${kitNumber}
    ${captainBand}
    ${headShape}
    ${headband}
    ${eyes}
  </g>
  ${football}
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}