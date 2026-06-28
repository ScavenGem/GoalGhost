"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useGhost } from "@/hooks/use-ghost";
import { useSharedLegacy } from "@/hooks/use-shared-legacy";
import { motion } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { uploadPublicJsonFromBrowser } from "@/lib/0g/storage/upload-public-browser";
import type { LegacyDocument } from "@/types/legacy";
import Link from "next/link";
import { LegacyCinematicUnwrap } from "@/components/legacy/cinematic/legacy-cinematic-unwrap";
import { PageHeader } from "@/components/layout/page-header";
import { GoalGhostLogo } from "@/components/ui/goalghost-logo";
import { OgIrreplaceableBanner } from "@/components/0g/og-irreplaceable-banner";
import { LegacyComments } from "@/components/legacy/legacy-comments";
import { buildLegacySharePayload } from "@/lib/legacy/share";
import { hoverLink } from "@/lib/utils/hover";
import { cn } from "@/lib/utils/cn";
import {
  buildLegacyDocument,
  type GhostLegacyInput,
  type GhostMemory,
  type LegacyApiOutput,
} from "@/lib/legacy/build-legacy";
import { gatherLegacyMemories } from "@/lib/legacy/gather-legacy-context";
import {
  fetchWithTimeout,
  readApiErrorMessage,
} from "@/lib/api/client-fetch";
import {
  assertFreshMainnetWalletBalance,
  buildSubAccountInitHeadline,
  ensureLegacyComputeSubAccount,
  fetchFreshMainnetWalletBalance,
  getLegacyComputeInitStatus,
  LEGACY_FIRST_TIME_LEDGER_OG,
  MIN_WALLET_BALANCE_OG,
  legacyInitMessage,
  type LegacyComputeInitStatus,
  type LegacyInitPhase,
} from "@/lib/0g/compute/ensure-legacy-sub-account";
import { chainScanAddressUrl } from "@/lib/0g/network";
import { buildInteractionEvolution } from "@/lib/ghost/evolution";
import { notifyMemoryAdded } from "@/lib/events/memory-sync";

function parseSharedTokenId(raw: string | null): number | null {
  if (!raw) return null;
  const tokenId = Number.parseInt(raw, 10);
  return Number.isFinite(tokenId) && tokenId >= 0 ? tokenId : null;
}

function LegacyPageContent() {
  const searchParams = useSearchParams();
  const sharedTokenId = parseSharedTokenId(searchParams.get("tokenId"));
  const { address } = useAccount();
  const { ghost, isLoading: fetching } = useGhost(address);
  const [legacy, setLegacy] = useState<LegacyDocument | null>(null);
  const shouldFetchShared =
    sharedTokenId != null &&
    (legacy == null || ghost?.tokenId !== sharedTokenId);
  const { shared, loading: sharedLoading, error: sharedError } = useSharedLegacy(
    shouldFetchShared ? sharedTokenId : null
  );
  const [generating, setGenerating] = useState(false);
  const [initPhase, setInitPhase] = useState<LegacyInitPhase | null>(null);
  const [copied, setCopied] = useState(false);
  const [showCinematic, setShowCinematic] = useState(false);
  const [legacySealed, setLegacySealed] = useState(false);
  const [sealing, setSealing] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [mainnetBalanceOg, setMainnetBalanceOg] = useState<number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [initStatus, setInitStatus] = useState<LegacyComputeInitStatus | null>(
    null
  );
  const [showInitNotice, setShowInitNotice] = useState(false);

  const viewingOthers =
    sharedTokenId != null &&
    (!address || !ghost || ghost.tokenId !== sharedTokenId);
  const displayGhost = ghost ?? shared?.ghost ?? null;
  const displayLegacy = legacy ?? shared?.legacy ?? null;

  const ghostLegacyInput = useMemo<GhostLegacyInput | null>(() => {
    if (!displayGhost) return null;
    return {
      name: displayGhost.name,
      team: displayGhost.team,
      evolutionScore: displayGhost.evolutionScore,
      confidence: displayGhost.confidence,
      mood: displayGhost.mood,
      tokenId: displayGhost.tokenId,
      memories:
        "memories" in displayGhost
          ? (displayGhost.memories as GhostMemory[] | undefined)
          : undefined,
    };
  }, [displayGhost]);

  useEffect(() => {
    if (displayLegacy) setShowCinematic(true);
  }, [displayLegacy]);

  useEffect(() => {
    if (!address || viewingOthers) {
      setMainnetBalanceOg(null);
      setBalanceLoading(false);
      setInitStatus(null);
      setShowInitNotice(false);
      return;
    }

    let cancelled = false;
    setBalanceLoading(true);

    void (async () => {
      try {
        const [balance, status] = await Promise.all([
          fetchFreshMainnetWalletBalance(address),
          getLegacyComputeInitStatus().catch(() => null),
        ]);
        if (cancelled) return;

        setMainnetBalanceOg(balance);
        setInitStatus(status);
        setShowInitNotice(status?.needsInitialization ?? false);

        if (!Number.isFinite(balance) || balance < MIN_WALLET_BALANCE_OG) {
          setGenerateError(
            `Insufficient 0G balance on mainnet. You need at least ${MIN_WALLET_BALANCE_OG} OG (current: ${balance.toFixed(4)} OG).`
          );
        } else {
          setGenerateError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setGenerateError(
            e instanceof Error ? e.message : "Mainnet balance check failed"
          );
        }
      } finally {
        if (!cancelled) setBalanceLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [address, viewingOthers]);

  async function shareLegacy() {
    if (!displayLegacy || !displayGhost) return;
    const { text, url } = buildLegacySharePayload({
      ghostName: displayGhost.name,
      team: displayGhost.team,
      tokenId: displayGhost.tokenId,
      memories: displayLegacy.stats.matchesWitnessed,
      evolution: displayLegacy.stats.peakEvolution,
      shareText: displayLegacy.shareText,
    });
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayGhost.name}'s GoalGhost Legacy`,
          text,
          url,
        });
        return;
      } catch {
        /* clipboard fallback */
      }
    }
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  async function persistLegacy(doc: LegacyDocument) {
    const { rootHash } = await uploadPublicJsonFromBrowser(
      doc as unknown as Record<string, unknown>
    );
    const evolution = buildInteractionEvolution("legacy_seal");
    await fetch("/api/memories/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokenId: doc.tokenId,
        eventId: `legacy-${doc.tokenId}`,
        type: "legacy",
        rootHash,
        occurredAt: doc.generatedAt,
        title: evolution.title,
        content: doc.story,
        emotionalTone: evolution.emotionalTone,
        evolutionDelta: evolution.evolutionDelta,
        confidenceDelta: evolution.confidenceDelta,
        mood: evolution.mood,
        traitDelta: evolution.traitDelta,
      }),
    });
    notifyMemoryAdded({ eventId: `legacy-${doc.tokenId}` });
    setLegacySealed(true);
  }

  async function sealLegacyToStorage() {
    if (!legacy) return;
    setSealing(true);
    setGenerateError(null);
    try {
      await persistLegacy(legacy);
    } catch (e) {
      setGenerateError(
        e instanceof Error ? e.message : "Failed to seal legacy to 0G Storage"
      );
    } finally {
      setSealing(false);
    }
  }

  async function generateLegacy() {
    if (!ghost || !address) return;
    setGenerating(true);
    setGenerateError(null);
    setInitPhase(null);

    try {
      setBalanceLoading(true);
      const balance = await assertFreshMainnetWalletBalance(address);
      setMainnetBalanceOg(balance);

      const status = await getLegacyComputeInitStatus().catch(() => null);
      setInitStatus(status);
      if (status?.needsInitialization) {
        setShowInitNotice(true);
      }

      setBalanceLoading(false);

      await ensureLegacyComputeSubAccount(setInitPhase);

      const refreshedStatus = await getLegacyComputeInitStatus().catch(() => null);
      setInitStatus(refreshedStatus);
      setShowInitNotice(refreshedStatus?.needsInitialization ?? false);

      setInitPhase("generating");
      const memories = await gatherLegacyMemories(address, ghost);

      const res = await fetchWithTimeout("/api/compute/legacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ghost: {
            name: ghost.name,
            team: ghost.team,
            evolutionScore: ghost.evolutionScore,
            tokenId: ghost.tokenId,
          },
          memories,
        }),
        timeoutMs: 60_000,
      });

      let data: {
        legacy?: LegacyApiOutput;
        proof?: LegacyDocument["computeProof"];
        error?: string;
        source?: string;
      };

      try {
        data = (await res.json()) as typeof data;
      } catch {
        throw new Error(
          await readApiErrorMessage(res, "Legacy API returned invalid JSON")
        );
      }

      if (!res.ok || !data.legacy) {
        throw new Error(data.error ?? "0G Compute unavailable");
      }

      const doc = buildLegacyDocument(ghost, data.legacy as LegacyApiOutput);
      if (data.proof) doc.computeProof = data.proof;

      setLegacy(doc);
      setShowCinematic(true);
      setLegacySealed(false);

      void persistLegacy(doc).catch(() => {
        /* user can seal from finale; unwrap still displays */
      });
    } catch (e) {
      const status = await getLegacyComputeInitStatus().catch(() => null);
      if (status) {
        setInitStatus(status);
        if (status.needsInitialization) {
          setShowInitNotice(true);
        }
      }
      setGenerateError(
        e instanceof Error ? e.message : "Legacy generation failed"
      );
    } finally {
      setBalanceLoading(false);
      setInitPhase(null);
      setGenerating(false);
    }
  }

  const initMessage = legacyInitMessage(initPhase);

  if (viewingOthers && sharedLoading) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-5">
        <GoalGhostLogo size={84} />
        <p className="text-xs uppercase tracking-[0.25em] text-muted">
          Loading shared legacy…
        </p>
      </div>
    );
  }

  if (viewingOthers && sharedError && !displayLegacy) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-32 text-center">
        <p className="font-display text-3xl text-muted">Legacy unavailable</p>
        <p className="text-sm text-muted/80">{sharedError}</p>
        <Link href="/legacy">
          <Button variant="outline">View your legacy</Button>
        </Link>
      </div>
    );
  }

  if (viewingOthers && displayLegacy && displayGhost && ghostLegacyInput) {
    return (
      <div className="relative mx-auto max-w-3xl space-y-10 pb-8">
        {showCinematic && (
          <LegacyCinematicUnwrap
            ghost={ghostLegacyInput}
            legacy={displayLegacy}
            onShare={shareLegacy}
            shareCopied={copied}
            readOnly
            onComplete={() => setShowCinematic(false)}
          />
        )}
        {!showCinematic && (
          <>
            <PageHeader
              eyebrow="Shared legacy"
              title={`${displayGhost.name}'s Legacy`}
              description="A wallet-owned World Cup story sealed on 0G Storage. Comments below are public for everyone."
            />
            <OgIrreplaceableBanner />
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => setShowCinematic(true)}>
                Replay the Journey
              </Button>
            </div>
          </>
        )}
        <LegacyComments />
      </div>
    );
  }

  if (!address && !sharedTokenId) {
    return (
      <div className="mx-auto max-w-lg py-32 text-center">
        <p className="font-display text-3xl text-muted">Connect your wallet</p>
        <p className="mt-3 text-sm text-muted/80">Your legacy belongs to you alone.</p>
      </div>
    );
  }

  if (fetching && address) {
    return (
      <div className="flex min-h-[55vh] flex-col items-center justify-center gap-5">
        <GoalGhostLogo size={84} />
        <p className="text-xs uppercase tracking-[0.25em] text-muted">
          Preparing your legacy…
        </p>
      </div>
    );
  }

  if (!ghost && address) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-32 text-center">
        <p className="font-display text-3xl">No ghost yet</p>
        <p className="text-muted">Birth your GoalGhost before the final whistle.</p>
        <Link href="/create">
          <Button size="lg">Create GoalGhost</Button>
        </Link>
      </div>
    );
  }

  if (!displayGhost) {
    return (
      <div className="mx-auto max-w-lg py-32 text-center">
        <p className="font-display text-3xl text-muted">Connect your wallet</p>
        <p className="mt-3 text-sm text-muted/80">Your legacy belongs to you alone.</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-3xl space-y-10 pb-8">
      {displayLegacy && ghostLegacyInput && showCinematic && (
        <LegacyCinematicUnwrap
          ghost={ghostLegacyInput}
          legacy={displayLegacy}
          onShare={shareLegacy}
          onSeal={sealLegacyToStorage}
          shareCopied={copied}
          sealing={sealing}
          sealed={legacySealed}
          onComplete={() => setShowCinematic(false)}
        />
      )}

      {!showCinematic && (
        <>
          <PageHeader
            eyebrow="The judge moment"
            title="Your Legacy"
            description="Your tournament Spirit, wrapped in emotion: every rivalry, comeback, and final whistle, narrated by 0G Compute and verified on 0G Storage."
          />

          <OgIrreplaceableBanner />
        </>
      )}

      {!showCinematic && !displayLegacy ? (
          <motion.div
            className="flex flex-col items-center space-y-10 rounded-3xl border border-[#F4C542]/15 bg-[#0A1020]/70 py-28"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <GoalGhostLogo size={96} className="shrink-0" />
            <div className="max-w-md space-y-3 text-center">
              <p className="font-display text-3xl md:text-4xl">
                Ready, <span className="text-[#F4C542]">{displayGhost.name}</span>?
              </p>
              <p className="text-muted">
                {ghost?.memories?.length ?? 0} evolution chapters · {displayGhost.evolutionScore} evolution ·{" "}
                {displayGhost.confidence}% conviction · {displayGhost.team}
              </p>
            </div>
            {address && (
              <div className="w-full max-w-md rounded-xl border border-dashed border-[#F4C542]/25 bg-[#0A1020]/90 px-4 py-4 text-left text-xs">
                <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[#F4C542]/80">
                  Wallet debug
                </p>
                {showInitNotice && initStatus?.needsInitialization && (
                  <div className="mb-4 space-y-3 rounded-lg border border-amber-500/25 bg-amber-500/5 px-3 py-3">
                    <p className="font-mono text-[11px] leading-relaxed text-amber-100/95">
                      {buildSubAccountInitHeadline(initStatus.providerAddress)}
                    </p>
                    <dl className="space-y-2 text-muted">
                      <div>
                        <dt className="text-muted/70">Connected main wallet</dt>
                        <dd className="mt-0.5 break-all font-mono text-sm text-foreground/90">
                          <a
                            href={chainScanAddressUrl(initStatus.mainWalletAddress)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn("text-[#F4C542]/90", hoverLink)}
                          >
                            {initStatus.mainWalletAddress}
                          </a>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-muted/70">Sub-account address (fund this)</dt>
                        <dd className="mt-0.5 break-all font-mono text-sm text-foreground/90">
                          <a
                            href={chainScanAddressUrl(initStatus.providerAddress)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn("text-[#F4C542]/90", hoverLink)}
                          >
                            {initStatus.providerAddress}
                          </a>
                        </dd>
                      </div>
                    </dl>
                    <p className="leading-relaxed text-amber-100/90">
                      Click <span className="font-medium text-amber-50">Unwrap Your Legacy</span>{" "}
                      to automatically initialize your ledger. We will transfer{" "}
                      {LEGACY_FIRST_TIME_LEDGER_OG} OG from your connected wallet (approve the
                      wallet transactions when prompted).
                    </p>
                  </div>
                )}
                <dl className="space-y-3 text-muted">
                  <div>
                    <dt className="text-muted/70">Connected wallet</dt>
                    <dd className="mt-0.5 break-all font-mono text-sm text-foreground/90">
                      <a
                        href={chainScanAddressUrl(address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn("text-[#F4C542]/90", hoverLink)}
                      >
                        {address}
                      </a>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted/70">Mainnet 0G balance (live)</dt>
                    <dd className="mt-0.5 font-mono text-sm text-foreground/90">
                      {balanceLoading
                        ? "Fetching from mainnet…"
                        : mainnetBalanceOg != null
                          ? `${mainnetBalanceOg.toFixed(4)} OG`
                          : "Unavailable"}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
            {generateError && (
              <p className="max-w-sm text-center text-sm text-rose-400/90">
                {generateError}
              </p>
            )}
            {generating && (
              <p className="max-w-sm text-center text-sm text-[#F4C542]/90">
                {initMessage ?? "Preparing your legacy…"}
              </p>
            )}
            <Button
              size="lg"
              onClick={generateLegacy}
              disabled={generating}
              className="shadow-lg shadow-[#F4C542]/10"
            >
              {generating ? "Unwrapping…" : "Unwrap Your Legacy"}
            </Button>
          </motion.div>
      ) : !showCinematic ? (
          <div className="flex flex-col items-center gap-6 rounded-3xl border border-[#F4C542]/15 bg-[#0A1020]/70 py-16 text-center">
            <p className="font-display text-2xl text-white/90">
              Your Spirit legacy is ready
            </p>
            <p className="max-w-md text-sm text-muted/80">
              Replay the cinematic ceremony or continue to the public comments wall.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" onClick={() => setShowCinematic(true)}>
                Replay the Journey
              </Button>
              <Link href="/memories" className={cn("text-sm text-[#F4C542]/80", hoverLink)}>
                See it in your Fan Journey →
              </Link>
            </div>
          </div>
      ) : null}

      <LegacyComments />
    </div>
  );
}

export default function LegacyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[55vh] flex-col items-center justify-center gap-5">
          <GoalGhostLogo size={84} />
          <p className="text-xs uppercase tracking-[0.25em] text-muted">
            Preparing your legacy…
          </p>
        </div>
      }
    >
      <LegacyPageContent />
    </Suspense>
  );
}