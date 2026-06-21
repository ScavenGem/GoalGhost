"use client";

import { Suspense, useEffect, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useAccount } from "wagmi";
import { useGhost } from "@/hooks/use-ghost";
import { useSharedLegacy } from "@/hooks/use-shared-legacy";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/lib/motion";
import { Button } from "@/components/ui/button";
import { uploadPublicJsonFromBrowser } from "@/lib/0g/storage/upload-public-browser";
import type { LegacyDocument } from "@/types/legacy";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Share2, Pause, Play } from "lucide-react";
import { WrappedSlide } from "@/components/legacy/wrapped-slide";
import { WrappedProgress } from "@/components/legacy/wrapped-progress";
import { PageHeader } from "@/components/layout/page-header";
import { ConfettiCelebration } from "@/components/ui/confetti";
import { GoalGhostLogo } from "@/components/ui/goalghost-logo";
import { OgIrreplaceableBanner } from "@/components/0g/og-irreplaceable-banner";
import { LegacyComments } from "@/components/legacy/legacy-comments";
import { buildLegacySharePayload } from "@/lib/legacy/share";
import {
  buildLegacyDocument,
  buildLegacySlides,
  type LegacyApiOutput,
} from "@/lib/legacy/build-legacy";

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
  const [slide, setSlide] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  const viewingOthers =
    sharedTokenId != null &&
    (!address || !ghost || ghost.tokenId !== sharedTokenId);
  const displayGhost = ghost ?? shared?.ghost ?? null;
  const displayLegacy = legacy ?? shared?.legacy ?? null;

  const slides = useMemo(
    () =>
      displayLegacy && displayGhost
        ? buildLegacySlides(displayGhost, displayLegacy)
        : [],
    [displayLegacy, displayGhost]
  );

  const nextSlide = useCallback(() => {
    setSlide((s) => {
      if (s < slides.length - 1) return s + 1;
      return autoPlay ? 0 : s;
    });
  }, [slides.length, autoPlay]);

  useEffect(() => {
    if (!displayLegacy || !autoPlay) return;
    const t = setInterval(nextSlide, 5500);
    return () => clearInterval(t);
  }, [displayLegacy, autoPlay, nextSlide, slide]);

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
    await fetch("/api/memories/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokenId: doc.tokenId,
        eventId: `legacy-${doc.tokenId}`,
        type: "legacy",
        rootHash,
        occurredAt: doc.generatedAt,
        title: "Your World Cup Legacy",
        content: doc.story,
      }),
    });
  }

  async function generateLegacy() {
    if (!ghost) return;
    setGenerating(true);
    setGenerateError(null);

    try {
      const res = await fetch("/api/compute/legacy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ghost: {
            name: ghost.name,
            team: ghost.team,
            evolutionScore: ghost.evolutionScore,
            tokenId: ghost.tokenId,
          },
          memories: ghost.memories ?? [],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.legacy) {
        throw new Error(data.error ?? "0G Compute unavailable");
      }

      const doc = buildLegacyDocument(ghost, data.legacy as LegacyApiOutput);
      if (data.proof) doc.computeProof = data.proof;

      setLegacy(doc);
      setSlide(0);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 4500);

      void persistLegacy(doc).catch(() => {
        /* storage is best-effort; wrapped content still displays */
      });
    } catch (e) {
      setGenerateError(
        e instanceof Error ? e.message : "Legacy generation failed"
      );
    } finally {
      setGenerating(false);
    }
  }

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

  if (viewingOthers && displayLegacy && displayGhost) {
    return (
      <>
        <div className="relative mx-auto max-w-3xl space-y-10 pb-8">
          <PageHeader
            eyebrow="Shared legacy"
            title={`${displayGhost.name}'s Legacy`}
            description="A wallet-owned World Cup story sealed on 0G Storage. Comments below are public for everyone."
          />

          <OgIrreplaceableBanner />

          <div className="space-y-6">
            <WrappedProgress current={slide} total={slides.length} autoPlay={autoPlay} />

            <AnimatePresence mode="wait">
              <WrappedSlide key={slide} slide={slides[slide]} active />
            </AnimatePresence>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <Button
                variant="ghost"
                size="sm"
                disabled={slide === 0}
                onClick={() => setSlide((s) => s - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAutoPlay((a) => !a)}
                  className="text-muted transition-colors hover:text-[#F4C542]"
                  aria-label={autoPlay ? "Pause" : "Play"}
                >
                  {autoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <div className="flex gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSlide(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === slide ? "w-8 bg-[#F4C542]" : "w-2 bg-white/20 hover:bg-white/35"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={slide === slides.length - 1 ? "default" : "outline"}
                  size="sm"
                  onClick={shareLegacy}
                  className={slide === slides.length - 1 ? "shadow-md shadow-[#F4C542]/15" : ""}
                >
                  <Share2 className="mr-1 h-4 w-4" />
                  {copied ? "Copied!" : "Share Legacy"}
                </Button>
                {slide < slides.length - 1 && (
                  <Button variant="outline" size="sm" onClick={nextSlide}>
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <LegacyComments />
        </div>
      </>
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
    <>
      <ConfettiCelebration active={showConfetti} />
      <div className="relative mx-auto max-w-3xl space-y-10 pb-8">
        <PageHeader
          eyebrow="The judge moment"
          title="Your Legacy"
          description="Your tournament wrapped in emotion: every rivalry, comeback, and final whistle, narrated by 0G Compute and sealed forever on 0G Storage."
        />

        <OgIrreplaceableBanner />

        {!displayLegacy ? (
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
                {ghost?.memories?.length ?? 0} memories · {displayGhost.evolutionScore} evolution ·{" "}
                {displayGhost.confidence}% conviction · {displayGhost.team}
              </p>
            </div>
            {generateError && (
              <p className="max-w-sm text-center text-sm text-rose-400/90">
                {generateError}
              </p>
            )}
            <Button
              size="lg"
              onClick={generateLegacy}
              disabled={generating}
              className="shadow-lg shadow-[#F4C542]/10"
            >
              Unwrap Your Legacy
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <WrappedProgress current={slide} total={slides.length} autoPlay={autoPlay} />

            <AnimatePresence mode="wait">
              <WrappedSlide key={slide} slide={slides[slide]} active />
            </AnimatePresence>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <Button
                variant="ghost"
                size="sm"
                disabled={slide === 0}
                onClick={() => setSlide((s) => s - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAutoPlay((a) => !a)}
                  className="text-muted transition-colors hover:text-[#F4C542]"
                  aria-label={autoPlay ? "Pause" : "Play"}
                >
                  {autoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <div className="flex gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSlide(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === slide ? "w-8 bg-[#F4C542]" : "w-2 bg-white/20 hover:bg-white/35"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={slide === slides.length - 1 ? "default" : "outline"}
                  size="sm"
                  onClick={shareLegacy}
                  className={slide === slides.length - 1 ? "shadow-md shadow-[#F4C542]/15" : ""}
                >
                  <Share2 className="mr-1 h-4 w-4" />
                  {copied ? "Copied!" : "Share Legacy"}
                </Button>
                {slide < slides.length - 1 && (
                  <Button variant="outline" size="sm" onClick={nextSlide}>
                    Next
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex justify-center rounded-2xl border border-[#F4C542]/10 bg-[#0A1020]/50 py-6">
              <Link href="/memories" className="text-sm text-[#F4C542]/80 hover:text-[#F4C542]">
                See it in your Memory Timeline →
              </Link>
            </div>
          </div>
        )}

        <LegacyComments />
      </div>
    </>
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