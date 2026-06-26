"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ghost, Home, Radio, ScrollText, Sparkles, Trophy } from "lucide-react";
import { GoalGhostLogo } from "@/components/ui/goalghost-logo";
import { SidebarFooter } from "@/components/layout/sidebar-footer";
import { useNavPrefetch } from "@/hooks/use-nav-prefetch";
import { hoverNavTab, hoverNavTabActive, hoverNavTabInactive } from "@/lib/utils/hover";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/create", label: "Create", icon: Sparkles },
  { href: "/ghost", label: "My Ghost", icon: Ghost },
  { href: "/memories", label: "Fan Journey", icon: ScrollText },
  { href: "/legacy", label: "Legacy", icon: Trophy },
  { href: "/matches", label: "Match Center", icon: Radio },
] as const;

export function SidebarNav() {
  const pathname = usePathname();
  const prefetchRoute = useNavPrefetch();

  return (
    <aside className="flex min-h-full w-60 shrink-0 flex-col border-r border-white/8 bg-[#0A1020] px-4 py-6">
      <Link
        href="/"
        onMouseEnter={() => prefetchRoute("/")}
        onFocus={() => prefetchRoute("/")}
        className="mb-10 flex items-center gap-2.5 overflow-visible px-2"
      >
        <GoalGhostLogo size={44} className="shrink-0" />
        <div>
          <p className="text-sm font-semibold tracking-wide">GoalGhost</p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-muted">
            0G Zero Cup
          </p>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onMouseEnter={() => prefetchRoute(href)}
              onFocus={() => prefetchRoute(href)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm",
                hoverNavTab,
                active
                  ? cn("bg-[#F4C542]/15 text-[#F4C542]", hoverNavTabActive)
                  : cn("text-muted", hoverNavTabInactive)
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <SidebarFooter />
    </aside>
  );
}