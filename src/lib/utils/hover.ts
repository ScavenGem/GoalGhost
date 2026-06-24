/** Shared 0.2s ease-in-out hover utilities — hover-only effects, no base style changes. */
export const hoverEase =
  "transition-[transform,box-shadow,border-color,background-color,color,opacity,filter,font-weight] duration-200 ease-in-out";

export const hoverNavTab =
  `${hoverEase} hover:scale-[1.02] active:scale-[0.98]`;

export const hoverNavTabInactive =
  "hover:bg-[#F4C542]/12 hover:text-[#F4C542] hover:ring-1 hover:ring-inset hover:ring-[#F4C542]/25";

export const hoverNavTabActive =
  "hover:bg-[#F4C542]/20 hover:ring-1 hover:ring-inset hover:ring-[#F4C542]/35";

export const hoverCard =
  `${hoverEase} hover:-translate-y-0.5 hover:border-[#F4C542]/30 hover:shadow-lg hover:shadow-[#F4C542]/10`;

export const hoverCardSubtle =
  `${hoverEase} hover:-translate-y-0.5 hover:border-[#F4C542]/25 hover:bg-[#0A1020]/90 hover:shadow-md hover:shadow-[#F4C542]/8`;

/** Gold-toned text links */
export const hoverLink =
  `${hoverEase} hover:text-[#F4C542]`;

/** Muted links → faded white or gold on hover */
export const hoverLinkMuted =
  `${hoverEase} hover:text-white/85 hover:brightness-110`;

export const hoverLinkSubtle =
  `${hoverEase} hover:text-[#F4C542] hover:underline hover:underline-offset-2`;

export const hoverEmoji =
  `${hoverEase} hover:scale-110 hover:border-[#F4C542]/35 hover:bg-[#F4C542]/10`;

export const hoverIconBtn =
  `${hoverEase} hover:scale-105 hover:bg-white/5`;

export const hoverTextAction =
  `${hoverEase} hover:scale-[1.02] hover:bg-white/[0.04]`;

/** See More / Load More / Show More — bolder text on hover */
export const hoverLoadMore =
  `${hoverEase} hover:font-semibold hover:text-[#F4C542]`;

/** Connect-wallet CTA (sidebar, create flow) */
export const hoverConnectWallet =
  `${hoverEase} hover:-translate-y-0.5 hover:bg-[#F4C542]/10 hover:shadow-[0_0_16px_rgba(244,197,66,0.15)]`;

/** Connected wallet address chip */
export const hoverWalletChip =
  `${hoverEase} hover:scale-[1.02] hover:bg-white/[0.04] hover:text-[#F4C542]/90`;

/** Header / mobile wallet connect button */
export const hoverHeaderConnect =
  `${hoverEase} hover:scale-[1.02] hover:border-[#F4C542]/35 hover:bg-[#F4C542]/8 hover:shadow-[0_0_12px_rgba(244,197,66,0.12)]`;

/** Gradient promo banners (ghost page, CTAs) */
export const hoverPromoBanner =
  `${hoverEase} hover:-translate-y-0.5 hover:border-[#F4C542]/35 hover:from-[#F4C542]/14 hover:shadow-md hover:shadow-[#F4C542]/10`;

/** Legacy wrapped slide indicator — inactive dot */
export const hoverSlideDotInactive =
  `${hoverEase} hover:scale-125 hover:bg-white/35`;

/** Legacy wrapped slide indicator — active dot */
export const hoverSlideDotActive =
  `${hoverEase} hover:brightness-110`;

/** Selected nation / archetype card — subtle lift on hover */
export const hoverSelectionActive =
  `${hoverEase} hover:-translate-y-0.5 hover:border-[#F4C542]/70 hover:shadow-xl hover:shadow-[#F4C542]/20`;