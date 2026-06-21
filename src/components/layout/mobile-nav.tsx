"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ghost, Home, Radio, ScrollText, Sparkles, Trophy } from "lucide-react";
import { useNavPrefetch } from "@/hooks/use-nav-prefetch";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/create", label: "Create", icon: Sparkles },
  { href: "/ghost", label: "Ghost", icon: Ghost },
  { href: "/matches", label: "Matches", icon: Radio },
  { href: "/memories", label: "Memories", icon: ScrollText },
  { href: "/legacy", label: "Legacy", icon: Trophy },
] as const;

export function MobileNav() {
  const pathname = usePathname();
  const prefetchRoute = useNavPrefetch();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/8 bg-[#0A1020]/95 px-2 py-2 backdrop-blur-md md:hidden">
      <div className="flex justify-around gap-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onTouchStart={() => prefetchRoute(href)}
              onMouseEnter={() => prefetchRoute(href)}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[10px] transition-colors",
                active ? "text-[#F4C542]" : "text-muted"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}