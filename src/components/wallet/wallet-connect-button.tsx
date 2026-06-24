"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { shortenWalletAddress } from "@/lib/legacy/comment-sign";
import {
  hoverConnectWallet,
  hoverHeaderConnect,
  hoverWalletChip,
} from "@/lib/utils/hover";
import { cn } from "@/lib/utils/cn";

type WalletConnectVariant = "header" | "pill";

export function WalletConnectButton({
  variant = "header",
  className,
}: {
  variant?: WalletConnectVariant;
  className?: string;
}) {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
            className={className}
          >
            {connected ? (
              <button
                type="button"
                onClick={openAccountModal}
                className={cn(
                  variant === "header"
                    ? cn(
                        "rounded-lg border border-white/10 px-3 py-1.5 font-mono text-sm text-muted/80",
                        hoverHeaderConnect,
                        "hover:text-[#F4C542]/90"
                      )
                    : cn(
                        "max-w-[8.5rem] truncate font-mono text-xs text-muted/75",
                        hoverWalletChip
                      )
                )}
              >
                {shortenWalletAddress(account.address)}
              </button>
            ) : (
              <button
                type="button"
                onClick={openConnectModal}
                className={cn(
                  variant === "header"
                    ? cn(
                        "rounded-lg border border-[#F4C542]/30 px-4 py-2 text-sm font-medium text-[#F4C542]",
                        hoverHeaderConnect
                      )
                    : cn(
                        "rounded-lg border border-[#F4C542]/25 px-3.5 py-2 text-xs font-medium text-[#F4C542]/90",
                        hoverConnectWallet
                      )
                )}
              >
                Connect Wallet
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}