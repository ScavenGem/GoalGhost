import type { Metadata } from "next";
import { Inter, DM_Serif_Display } from "next/font/google";
import { Web3Provider } from "@/lib/wagmi/provider";
import { AppShell } from "@/components/layout/app-shell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

export const metadata: Metadata = {
  title: "GoalGhost - Living Football Identity on 0G",
  description:
    "Every World Cup creates memories. GoalGhost makes them permanent on 0G Compute, Storage, and Chain.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable}`}>
      <head>
        <link rel="preconnect" href="https://evmrpc.0g.ai" />
        <link rel="preconnect" href="https://indexer-storage-turbo.0g.ai" />
        <link rel="dns-prefetch" href="https://evmrpc.0g.ai" />
        <link rel="dns-prefetch" href="https://indexer-storage-turbo.0g.ai" />
      </head>
      <body>
        <Web3Provider>
          <AppShell>{children}</AppShell>
        </Web3Provider>
      </body>
    </html>
  );
}