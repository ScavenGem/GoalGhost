"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { GoalGhostFullLogo } from "@/components/ui/goalghost-full-logo";
import { WalletConnectButton } from "@/components/wallet/wallet-connect-button";
import { useSidebarNotifications } from "@/hooks/use-sidebar-notifications";
import { hoverIconBtn } from "@/lib/utils/hover";
import { cn } from "@/lib/utils/cn";

/** ~2× OgLayerBadges pill row height (py-2/h-3 ≈ 2.125rem; sm py-2.5/h-3.5 ≈ 2.375rem). */
const SIDEBAR_FOOTER_MIN_H =
  "min-h-[calc(2*2.125rem+2rem)] sm:min-h-[calc(2*2.375rem+2.25rem)]";

/** Matches OgLayerBadges footer bottom inset (py-6 / sm:py-8) for pill-row alignment. */
const OG_BADGES_SPACER = "min-h-6 flex-1 sm:min-h-8";

export function SidebarFooter() {
  const { count, markAsSeen } = useSidebarNotifications();
  const badgeLabel = count > 99 ? "99+" : String(count);

  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-4 mt-auto shrink-0 border-t border-white/8 bg-[#0A1020]",
        SIDEBAR_FOOTER_MIN_H
      )}
    >
      <div className="flex h-full min-h-[inherit] w-full flex-col px-5">
        <div aria-hidden="true" className={OG_BADGES_SPACER} />
        <div className="flex w-full shrink-0 flex-col items-center gap-2">
          <GoalGhostFullLogo width={72} />

          <div className="flex w-full items-center justify-center gap-3.5">
            <WalletConnectButton variant="pill" />

            <Link
              href="/memories"
              onClick={() => {
                if (count > 0) markAsSeen();
              }}
              aria-label={
                count > 0
                  ? `Fan Journey notifications, ${count} new`
                  : "Fan Journey notifications"
              }
              className={cn(
                "relative inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-muted/60",
                hoverIconBtn,
                "hover:text-[#F4C542]/90"
              )}
            >
              <Bell className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F4C542] px-0.5 text-[9px] font-semibold leading-none text-[#0A1020]">
                  {badgeLabel}
                </span>
              )}
            </Link>
          </div>
        </div>
        <div aria-hidden="true" className={OG_BADGES_SPACER} />
      </div>
    </div>
  );
}