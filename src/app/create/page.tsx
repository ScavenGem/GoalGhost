"use client";

import { Suspense, useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ConnectButton, useConnectModal } from "@rainbow-me/rainbowkit";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/lib/motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StepProgress } from "@/components/create/step-progress";
import { AmbientGlow } from "@/components/create/ambient-glow";
import { TeamSelector } from "@/components/create/team-selector";
import { PersonalityCards } from "@/components/create/personality-cards";
import { BirthRitual } from "@/components/create/birth-ritual";
import { GoalGhostLogo } from "@/components/ui/goalghost-logo";
import { GhostReveal } from "@/components/create/ghost-reveal";
import type { WcNation } from "@/lib/football/teams";
import {
  type GhostApiRecord,
  seedGhostCache,
  syncGhostCache,
} from "@/hooks/use-ghost";
import {
  preloadStorageSdk,
  prepareEciesSealUpload,
} from "@/lib/0g/storage/browser-signer";

const uploadBrowserModule = import("@/lib/0g/storage/upload-browser");
import { AGENTIC_ID_ABI } from "@/lib/0g/chain/config";
import { buildIntelligentDataEntries } from "@/lib/0g/chain/hashes";
import { parseMintedTokenId } from "@/lib/0g/chain/parse-receipt";
import { walletToTokenId } from "@/lib/ghost/wallet-token-id";
import type { GhostProfile, GhostTraits } from "@/types/ghost";
import type { MemoryEvent } from "@/types/memory";
import { useRouter, useSearchParams } from "next/navigation";
import { parsePreMatchFixture } from "@/lib/create/pre-match-fixture";
import { WC_2026_NATIONS } from "@/lib/football/teams";
import { storageScanUrl } from "@/lib/0g/network";
import { ExternalLink, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { OgIrreplaceableBanner } from "@/components/0g/og-irreplaceable-banner";
import {
  fetchWithTimeout,
  formatClientFetchError,
  readApiErrorMessage,
} from "@/lib/api/client-fetch";

const CREATE_GHOST_TIMEOUT_MS = 65_000;

const DEFAULT_TRAITS: GhostTraits = {
  passion: 70,
  loyalty: 80,
  drama: 50,
  hope: 75,
  resilience: 65,
};

type Step =
  | "wallet"
  | "team"
  | "traits"
  | "generating"
  | "reveal"
  | "minting"
  | "memory"
  | "done";

const STEP_INDEX: Record<Step, number> = {
  wallet: 0,
  team: 1,
  traits: 2,
  generating: 3,
  reveal: 3,
  minting: 4,
  memory: 5,
  done: 5,
};

function CreatePageContent() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preMatchFixture = useMemo(
    () => parsePreMatchFixture(searchParams),
    [searchParams]
  );
  const queryClient = useQueryClient();
  const [step, setStep] = useState<Step>("wallet");
  const [team, setTeam] = useState<WcNation | null>(null);
  const [archetypeId, setArchetypeId] = useState<string | null>(null);
  const [traits, setTraits] = useState<GhostTraits>(DEFAULT_TRAITS);
  const [ghost, setGhost] = useState<Partial<GhostProfile> | null>(null);
  const [profileRoot, setProfileRoot] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [memoryRoot, setMemoryRoot] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const profileRootRef = useRef<string | null>(null);

  const contractAddress = process.env
    .NEXT_PUBLIC_AGENTIC_ID_CONTRACT as `0x${string}` | undefined;
  const hasContract =
    !!contractAddress && contractAddress.length > 2;
  const {
    writeContract,
    data: txHash,
    isPending: isMintPending,
    error: writeError,
    reset: resetWriteContract,
  } = useWriteContract();
  const { data: receipt, isSuccess: minted } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  useEffect(() => {
    if (isConnected && step === "wallet") setStep("team");
  }, [isConnected, step]);

  useEffect(() => {
    if (!preMatchFixture || team) return;
    const code = preMatchFixture.homeTeamCode;
    if (!code) return;
    const nation = WC_2026_NATIONS.find((n) => n.code === code);
    if (nation) setTeam(nation);
  }, [preMatchFixture, team]);

  useEffect(() => {
    if (step === "traits" || step === "reveal") {
      void preloadStorageSdk();
      void uploadBrowserModule;
    }
    if (step === "reveal") {
      void prepareEciesSealUpload();
    }
  }, [step]);

  async function generateGhost() {
    if (!team || !archetypeId) return;

    if (!isConnected || !address) {
      openConnectModal?.();
      setError("Connect your wallet to birth your GoalGhost");
      setStep("wallet");
      return;
    }

    setStep("generating");
    setError(null);

    try {
      const res = await fetchWithTimeout("/api/compute/create-ghost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team: team.name, teamCode: team.code, traits }),
        timeoutMs: CREATE_GHOST_TIMEOUT_MS,
      });

      if (!res.ok) {
        throw new Error(
          await readApiErrorMessage(res, "0G Compute unavailable")
        );
      }

      const data = (await res.json()) as {
        ghost?: Partial<GhostProfile>;
        proof?: GhostProfile["computeProof"];
      };

      if (!data.ghost?.name || !data.ghost.backstory) {
        throw new Error("0G Compute returned an incomplete ghost profile");
      }

      setGhost({ ...data.ghost, computeProof: data.proof });
      setStep("reveal");
    } catch (e) {
      setError(formatClientFetchError(e, "Failed to generate your GoalGhost"));
      setStep("traits");
    }
  }

  const finalizeCreation = useCallback(
    async (resolvedTokenId: number, resolvedProfileRoot: string) => {
      if (!ghost || !team || !address) return;
      setTokenId(resolvedTokenId);
      setProfileRoot(resolvedProfileRoot);
      profileRootRef.current = resolvedProfileRoot;
      setStep("memory");

      try {
      const birthMemory: MemoryEvent = {
        version: 1,
        id: `birth-${resolvedTokenId}`,
        tokenId: resolvedTokenId,
        type: "milestone",
        title: `${ghost.name} is born`,
        content: `On this day, a GoalGhost awakened for ${team.name}. ${ghost.backstory}`,
        emotionalTone: ghost.mood ?? "electric",
        evolutionDelta: 0,
        timestamp: new Date().toISOString(),
        computeProof: ghost.computeProof,
      };

      const { uploadJsonFromBrowser } = await uploadBrowserModule;

      const { rootHash: birthRoot } = await uploadJsonFromBrowser(birthMemory);
      setMemoryRoot(birthRoot);

      const ghostRegisterRes = await fetch("/api/ghost/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: resolvedTokenId,
          walletAddress: address,
          profileRoot: resolvedProfileRoot,
          team: team.name,
          name: ghost.name,
          mood: ghost.mood,
          confidence: 50,
        }),
      });

      if (!ghostRegisterRes.ok) {
        const data = await ghostRegisterRes.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ?? "Ghost registration failed"
        );
      }

      const memoryRegisterRes = await fetch("/api/memories/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: resolvedTokenId,
          eventId: birthMemory.id,
          type: "milestone",
          rootHash: birthRoot,
          occurredAt: birthMemory.timestamp,
          title: birthMemory.title,
          content: birthMemory.content,
          emotionalTone: birthMemory.emotionalTone,
        }),
      });

      if (!memoryRegisterRes.ok) {
        const data = await memoryRegisterRes.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ?? "Birth legacy registration failed"
        );
      }

      const ghostRecord: GhostApiRecord = {
        tokenId: resolvedTokenId,
        name: ghost.name!,
        team: team.name,
        evolutionScore: 0,
        confidence: 50,
        mood: ghost.mood ?? "electric",
        profileRoot: resolvedProfileRoot,
        memories: [
          {
            eventId: birthMemory.id,
            title: birthMemory.title,
            content: birthMemory.content,
            rootHash: birthRoot,
            emotionalTone: birthMemory.emotionalTone,
            type: "milestone",
            occurredAt: birthMemory.timestamp,
          },
        ],
      };

      seedGhostCache(queryClient, address, ghostRecord);
      await syncGhostCache(queryClient, address, ghostRecord);

      if (hasContract && contractAddress) {
        writeContract({
          address: contractAddress,
          abi: AGENTIC_ID_ABI,
          functionName: "logMilestone",
          args: [BigInt(resolvedTokenId), "GHOST_BIRTH", birthRoot],
        });
      }

      setStep("done");
      setTimeout(() => router.push("/ghost"), 4800);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Birth legacy seal failed");
        setStep("reveal");
      }
    },
    [
      ghost,
      team,
      address,
      hasContract,
      contractAddress,
      writeContract,
      router,
      queryClient,
    ]
  );

  async function sealGhost() {
    if (!ghost || !team) return;

    if (!isConnected || !address) {
      openConnectModal?.();
      setError("Connect your wallet to seal and mint your GoalGhost");
      setStep("wallet");
      return;
    }

    setStep("minting");
    setError(null);
    resetWriteContract();

    try {
      await prepareEciesSealUpload();

      const profile: GhostProfile = {
        version: 1,
        walletAddress: address,
        name: ghost.name!,
        backstory: ghost.backstory!,
        team: team.name,
        teamCode: team.code,
        traits: ghost.traits ?? traits,
        mood: ghost.mood ?? "electric",
        evolutionScore: 0,
        voice: ghost.voice ?? "",
        createdAt: new Date().toISOString(),
        computeProof: ghost.computeProof,
      };

      const { uploadJsonFromBrowser } = await uploadBrowserModule;

      const { rootHash } = await uploadJsonFromBrowser(profile);
      profileRootRef.current = rootHash;
      setProfileRoot(rootHash);

      const provisionalTokenId = walletToTokenId(address);
      const profileRegisterRes = await fetch("/api/ghost/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tokenId: provisionalTokenId,
          walletAddress: address,
          profileRoot: rootHash,
          team: team.name,
          name: ghost.name,
          mood: ghost.mood,
          confidence: 50,
        }),
      });

      if (!profileRegisterRes.ok) {
        const data = await profileRegisterRes.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ?? "Ghost registration failed"
        );
      }

      seedGhostCache(queryClient, address, {
        tokenId: provisionalTokenId,
        name: ghost.name!,
        team: team.name,
        evolutionScore: 0,
        confidence: 50,
        mood: ghost.mood ?? "electric",
        profileRoot: rootHash,
        memories: [],
      });

      if (hasContract && contractAddress) {
        const intelligentData = buildIntelligentDataEntries(rootHash, team.name);
        writeContract({
          address: contractAddress,
          abi: AGENTIC_ID_ABI,
          functionName: "iMint",
          args: [address, intelligentData],
          value: BigInt(0),
        });
        return;
      }

      await finalizeCreation(walletToTokenId(address), rootHash);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Storage seal failed");
      setStep("reveal");
    }
  }

  useEffect(() => {
    if (!minted || !receipt || step !== "minting") return;
    const id = parseMintedTokenId(receipt);
    const root = profileRootRef.current;
    if (id !== null && root) finalizeCreation(id, root);
    else if (id === null) {
      setError("Mint succeeded but could not parse tokenId from receipt");
      setStep("reveal");
    } else {
      setError("Profile root missing - please seal again");
      setStep("reveal");
    }
  }, [minted, receipt, step, finalizeCreation]);

  useEffect(() => {
    if (!writeError || step !== "minting") return;
    const msg = writeError.message.split("\n")[0]?.trim();
    setError(msg || "Wallet transaction failed");
    setStep("reveal");
    resetWriteContract();
  }, [writeError, step, resetWriteContract]);

  useEffect(() => {
    if (step !== "minting" || !txHash || minted) return;
    const timer = setTimeout(() => {
      setError("Mint transaction is taking too long. Check your wallet and try again.");
      setStep("reveal");
    }, 120_000);
    return () => clearTimeout(timer);
  }, [step, txHash, minted]);

  const sealLabel = hasContract
    ? "Encrypt to 0G Storage & Mint Agentic ID"
    : "Seal to 0G Storage & Awaken";

  return (
    <>
      <AmbientGlow />
      <div className="relative mx-auto max-w-2xl space-y-10 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-[#F4C542]">
            The birth ritual
          </p>
          <h1 className="font-display text-4xl leading-tight text-foreground md:text-5xl">
            Birth Your GoalGhost
          </h1>
          <p className="max-w-lg leading-relaxed text-muted">
            A fan identity born on 0G Compute, etched on 0G Storage, owned by your wallet.
            Not a profile, but a fan identity forged for every match.
          </p>
        </motion.div>

        <StepProgress current={STEP_INDEX[step]} />

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            <p>{error}</p>
            {(step === "traits" || step === "reveal") && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 h-7 text-red-200 hover:text-red-100"
                onClick={() => {
                  setError(null);
                  if (step === "traits" && archetypeId) void generateGhost();
                  else if (step === "reveal") void sealGhost();
                }}
              >
                Try again
              </Button>
            )}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === "wallet" && (
            <motion.div key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card className="border-[#F4C542]/15 bg-surface/50">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Own Your Ghost</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="leading-relaxed text-muted">
                    Your wallet owns your entire fan identity. ECIES encryption means only you can read your ghost&apos;s inner life, verified by 0G.
                  </p>
                  <div className="flex justify-center py-4">
                    <ConnectButton />
                  </div>
                  <p className="text-center text-xs text-muted">
                    0G Aristotle Mainnet · Chain 16661
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "team" && (
            <motion.div key="team" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
              <Card className="border-white/8 bg-surface/40">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Choose Your Nation</CardTitle>
                  <p className="text-sm text-muted">
                    {preMatchFixture
                      ? `Next fixture: ${preMatchFixture.homeTeam} vs ${preMatchFixture.awayTeam}. Choose your nation.`
                      : "One flag. One loyalty. Eternal."}
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <TeamSelector selected={team} onSelect={setTeam} />
                  <Button className="w-full" size="lg" disabled={!team} onClick={() => setStep("traits")}>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "traits" && (
            <motion.div key="traits" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
              <Card className="border-white/8 bg-surface/40">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Shape Your Fan Identity</CardTitle>
                  <p className="text-sm text-muted">
                    Archetype first, then fine-tune. Your ghost&apos;s personality becomes their forever voice.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <PersonalityCards
                    selectedId={archetypeId}
                    traits={traits}
                    onSelectArchetype={(id, t) => {
                      setArchetypeId(id);
                      setTraits(t);
                    }}
                    onTraitChange={setTraits}
                  />
                  <Button
                    onClick={generateGhost}
                    size="lg"
                    className="w-full"
                    disabled={!archetypeId}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate on 0G Compute
                  </Button>
                  {!archetypeId && (
                    <p className="text-center text-xs text-muted">Choose a personality to continue</p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === "generating" && (
            <motion.div key="gen" exit={{ opacity: 0 }} className="space-y-4">
              <BirthRitual
                team={team?.name}
                teamCode={team?.code}
                traits={traits}
              />
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setError("Generation cancelled");
                    setStep("traits");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}

          {step === "reveal" && ghost && team && (
            <motion.div key="reveal" exit={{ opacity: 0 }}>
              <GhostReveal
                name={ghost.name!}
                backstory={ghost.backstory!}
                voice={ghost.voice ?? ""}
                mood={ghost.mood ?? "electric"}
                traits={ghost.traits ?? traits}
                team={team.name}
                computeProof={ghost.computeProof}
                sealLabel={sealLabel}
                onMint={sealGhost}
              />
            </motion.div>
          )}

          {(step === "minting" || isMintPending) && (
            <motion.div key="mint" className="py-24 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mx-auto mb-6 flex justify-center">
                <GoalGhostLogo size={52} spin float />
              </div>
              <p className="font-display text-xl text-[#F4C542]">
                {hasContract ? "Minting Agentic ID" : "Sealing to 0G Storage"}
              </p>
              <p className="mt-2 text-sm text-muted">
                {hasContract
                  ? "Anchoring identity on 0G Chain…"
                  : "ECIES-encrypting your ghost to mainnet…"}
              </p>
            </motion.div>
          )}

          {step === "memory" && (
            <motion.div key="mem" className="py-24 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <motion.div className="mx-auto mb-4 h-2 w-40 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-[#F4C542]"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2.5 }}
                />
              </motion.div>
              <p className="font-display text-xl text-[#F4C542]">First evolution chapter written</p>
              <p className="mt-2 text-sm text-muted">Eternal · encrypted · yours</p>
            </motion.div>
          )}

          {step === "done" && ghost && (
            <motion.div
              key="done"
              className="space-y-8 py-12 text-center"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 120 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#F4C542]/40 bg-[#F4C542]/10"
              >
                <CheckCircle2 className="h-8 w-8 text-[#F4C542]" />
              </motion.div>

              <div>
                <motion.p
                  className="font-display text-4xl text-[#F4C542] md:text-5xl"
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {ghost.name} lives.
                </motion.p>
                <p className="mt-3 text-muted">
                  {hasContract
                    ? `Agentic ID #${tokenId} · anchored on 0G Chain`
                    : `Ghost #${tokenId} · sealed on 0G Storage`}
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mx-auto max-w-md space-y-3 rounded-2xl border border-[#F4C542]/20 bg-[#0A1020]/70 p-6 text-left"
              >
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#F4C542]">
                  Mainnet proof
                </p>
                {profileRoot && (
                  <a
                    href={storageScanUrl(profileRoot)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-mono text-xs text-muted transition-colors hover:text-[#F4C542]"
                  >
                    Profile · {profileRoot.slice(0, 20)}…
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                )}
                {memoryRoot && (
                  <a
                    href={storageScanUrl(memoryRoot)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 font-mono text-xs text-muted transition-colors hover:text-[#F4C542]"
                  >
                    Birth legacy · {memoryRoot.slice(0, 20)}…
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                )}
                <OgIrreplaceableBanner compact />
                <p className="text-xs text-muted/70">ECIES-encrypted · wallet-owned · eternal</p>
              </motion.div>

              <Link href="/ghost">
                <Button size="lg">Meet Your Ghost</Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

export default function CreatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <GoalGhostLogo size={52} spin />
        </div>
      }
    >
      <CreatePageContent />
    </Suspense>
  );
}