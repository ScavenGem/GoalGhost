/** Shared 0.2s ease hover utilities — hover-only effects, no base style changes. */
export const hoverEase =
  "transition-[transform,box-shadow,border-color,background-color,color,opacity,filter] duration-200 ease";

export const hoverNavTab =
  `${hoverEase} hover:scale-[1.02] active:scale-[0.98]`;

export const hoverNavTabInactive =
  "hover:bg-[#F4C542]/12 hover:text-[#F4C542]";

export const hoverNavTabActive =
  "hover:bg-[#F4C542]/20";

export const hoverCard =
  `${hoverEase} hover:-translate-y-0.5 hover:border-[#F4C542]/30 hover:shadow-lg hover:shadow-[#F4C542]/10`;

export const hoverCardSubtle =
  `${hoverEase} hover:-translate-y-0.5 hover:border-[#F4C542]/25 hover:bg-[#0A1020]/90 hover:shadow-md hover:shadow-[#F4C542]/8`;

export const hoverLink =
  `${hoverEase} hover:text-[#F4C542]`;

export const hoverLinkSubtle =
  `${hoverEase} hover:text-[#F4C542] hover:underline hover:underline-offset-2`;

export const hoverEmoji =
  `${hoverEase} hover:scale-110 hover:border-[#F4C542]/35 hover:bg-[#F4C542]/10`;

export const hoverIconBtn =
  `${hoverEase} hover:scale-105 hover:bg-white/5`;

export const hoverTextAction =
  `${hoverEase} hover:scale-[1.02] hover:bg-white/[0.04]`;