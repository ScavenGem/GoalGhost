"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/lib/motion";
import {
  Download,
  RotateCcw,
  Share2,
  ChevronRight,
  ChevronLeft,
  Volume2,
  VolumeX,
  X,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReadMoreText } from "@/components/ui/read-more-text";
import { GoalGhostLogo } from "@/components/ui/goalghost-logo";
import { GhostAvatar } from "@/components/ghost/ghost-avatar";
import { NationFlagEmoji } from "@/components/ui/nation-flag-emoji";
import { ConfettiCelebration } from "@/components/ui/confetti";
import { LegacyCinematicBackdrop } from "@/components/legacy/cinematic/legacy-cinematic-backdrop";
import { LegacyCinematicParticles } from "@/components/legacy/cinematic/legacy-cinematic-particles";
import {
  LegacyCinematicAudio,
  type LegacyCinematicAudioHandle,
} from "@/components/legacy/cinematic/legacy-cinematic-audio";
import type { LegacyDocument } from "@/types/legacy";
import type { GhostLegacyInput } from "@/lib/legacy/build-legacy";
import type { WalletIdentityProfile } from "@/lib/ghost/identity-distinctness";
import {
  buildCinematicChapters,
  cinematicHighlightStages,
  type CinematicChapter,
} from "@/lib/legacy/cinematic-chapters";
import { legacyDisplayText } from "@/lib/legacy/cinematic-text";
import { downloadLegacyFinaleImage } from "@/lib/legacy/download-legacy-image";
import { nationByName } from "@/lib/football/teams";
import { cn } from "@/lib/utils/cn";

type Phase = "intro" | CinematicChapter["id"] | "finale";

const PHASE_ORDER: Phase[] = ["intro", "birth", "journey", "evolution", "legacy", "finale"];

const PHASE_DWELL_MS: Record<Phase, number> = {
  intro: 6500,
  birth: 7500,
  journey: 8000,
  evolution: 8000,
  legacy: 8000,
  finale: 0,
};

const PHASE_LABELS: Record<Phase, string> = {
  intro: "Opening",
  birth: "Birth",
  journey: "Journey",
  evolution: "Evolution",
  legacy: "Legacy",
  finale: "Finale",
};

function pauseOnReadMore(expanded: boolean, setPlaying: (v: boolean) => void) {
  if (expanded) setPlaying(false);
}

function SlideProgress({
  phases,
  currentIndex,
  progress,
  isPlaying,
  onSelect,
}: {
  phases: Phase[];
  currentIndex: number;
  progress: number;
  isPlaying: boolean;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="flex w-full items-center gap-1.5" role="tablist" aria-label="Legacy slides">
      {phases.map((p, i) => {
        const filled =
          i < currentIndex ? 100 : i === currentIndex ? progress : 0;
        return (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={i === currentIndex}
            aria-label={`${PHASE_LABELS[p]} slide`}
            onClick={() => onSelect(i)}
            className="group relative h-1 flex-1 overflow-hidden rounded-full bg-white/12 transition-colors hover:bg-white/20"
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-[#F4C542]"
              initial={false}
              animate={{ width: `${filled}%` }}
              transition={
                i === currentIndex && isPlaying
                  ? { duration: 0.08, ease: "linear" }
                  : { duration: 0.25, ease: "easeOut" }
              }
            />
          </button>
        );
      })}
    </div>
  );
}

export function LegacyCinematicUnwrap({
  ghost,
  legacy,
  identity,
  onShare,
  onSeal,
  onComplete,
  shareCopied,
  sealing,
  sealed,
  readOnly = false,
}: {
  ghost: GhostLegacyInput;
  legacy: LegacyDocument;
  identity?: WalletIdentityProfile;
  onShare: () => void;
  onSeal?: () => Promise<void>;
  onComplete?: () => void;
  shareCopied?: boolean;
  sealing?: boolean;
  sealed?: boolean;
  readOnly?: boolean;
}) {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [slideProgress, setSlideProgress] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [mounted, setMounted] = useState(false);
  const audioRef = useRef<LegacyCinematicAudioHandle>(null);
  const goNextRef = useRef<() => void>(() => {});

  const phase = PHASE_ORDER[phaseIndex];
  const chapters = useMemo(
    () => buildCinematicChapters(ghost, legacy, identity),
    [ghost, legacy, identity]
  );
  const evolutionArc = useMemo(
    () => cinematicHighlightStages(ghost.evolutionScore),
    [ghost.evolutionScore]
  );
  const teamCode = nationByName(ghost.team)?.code;

  const ensureAudio = useCallback(() => {
    audioRef.current?.start();
    audioRef.current?.setMuted(!audioOn);
  }, [audioOn]);

  const exitCinematic = useCallback(() => {
    audioRef.current?.setMuted(true);
    onComplete?.();
  }, [onComplete]);

  const goToPhase = useCallback(
    (index: number) => {
      ensureAudio();
      const clamped = Math.max(0, Math.min(index, PHASE_ORDER.length - 1));
      setPhaseIndex(clamped);
      setSlideProgress(0);
      const next = PHASE_ORDER[clamped];
      if (next === "finale") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      } else if (clamped < PHASE_ORDER.indexOf("finale")) {
        setShowConfetti(false);
      }
    },
    [ensureAudio]
  );

  const goNext = useCallback(() => {
    if (phaseIndex >= PHASE_ORDER.length - 1) return;
    goToPhase(phaseIndex + 1);
  }, [phaseIndex, goToPhase]);

  const goPrev = useCallback(() => {
    if (phaseIndex <= 0) return;
    goToPhase(phaseIndex - 1);
  }, [phaseIndex, goToPhase]);

  goNextRef.current = goNext;

  const replay = useCallback(() => {
    ensureAudio();
    setIsPlaying(true);
    goToPhase(0);
    setShowConfetti(false);
  }, [ensureAudio, goToPhase]);

  const togglePlay = useCallback(() => {
    ensureAudio();
    setIsPlaying((v) => !v);
  }, [ensureAudio]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    if (!isPlaying || phase === "finale") return;

    setSlideProgress(0);
    const ms = PHASE_DWELL_MS[phase];
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const pct = Math.min(100, ((now - start) / ms) * 100);
      setSlideProgress(pct);
      if (pct < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const t = setTimeout(() => goNextRef.current(), ms);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [phaseIndex, isPlaying, phase]);

  useEffect(() => {
    audioRef.current?.setMuted(!audioOn);
  }, [audioOn]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          goNext();
          break;
        case "ArrowLeft":
          e.preventDefault();
          goPrev();
          break;
        case " ":
          e.preventDefault();
          togglePlay();
          break;
        case "Escape":
          e.preventDefault();
          exitCinematic();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev, togglePlay, exitCinematic]);

  const chapter = chapters.find((c) => c.id === phase);
  const canGoPrev = phaseIndex > 0;
  const canGoNext = phaseIndex < PHASE_ORDER.length - 1;

  const pauseReading = useCallback((expanded: boolean) => {
    pauseOnReadMore(expanded, setIsPlaying);
  }, []);

  const content = (
    <section
      className="fixed inset-0 z-[200] isolate flex flex-col overflow-hidden bg-[#0A1020] text-foreground"
      role="dialog"
      aria-modal="true"
      aria-label="Legacy unwrap ceremony"
    >
      <ConfettiCelebration active={showConfetti} duration={5000} />
      <LegacyCinematicAudio ref={audioRef} muted={!audioOn} />
      <LegacyCinematicBackdrop intense={phase === "finale" || phase === "legacy"} />
      <LegacyCinematicParticles active={phase !== "intro"} count={phase === "finale" ? 40 : 24} />

      {/* Top chrome */}
      <div className="relative z-20 shrink-0 space-y-3 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-8 sm:pt-5">
        <SlideProgress
          phases={PHASE_ORDER}
          currentIndex={phaseIndex}
          progress={slideProgress}
          isPlaying={isPlaying}
          onSelect={goToPhase}
        />
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[10px] uppercase tracking-[0.35em] text-[#F4C542]/70">
              GoalGhost Spirit Legacy
            </p>
            <p className="mt-0.5 text-[11px] text-muted/55">
              {phaseIndex + 1} / {PHASE_ORDER.length} · {PHASE_LABELS[phase]}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => {
                ensureAudio();
                setAudioOn((v) => {
                  const next = !v;
                  audioRef.current?.setMuted(!next);
                  return next;
                });
              }}
              className="rounded-lg p-2.5 text-muted/60 transition-colors duration-200 hover:bg-white/5 hover:text-[#F4C542]"
              aria-label={audioOn ? "Mute ambience" : "Enable ambience"}
              title={audioOn ? "Mute stadium ambience" : "Enable stadium ambience"}
            >
              {audioOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={exitCinematic}
              className="rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted/70 transition-colors duration-200 hover:bg-white/5 hover:text-white"
              aria-label="Exit legacy unwrap"
              title="Exit (Esc)"
            >
              <span className="flex items-center gap-1.5">
                <X className="h-4 w-4" />
                <span className="hidden sm:inline">Exit</span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide canvas */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <button
          type="button"
          aria-label="Previous slide"
          disabled={!canGoPrev}
          onClick={goPrev}
          className={cn(
            "absolute left-0 top-0 z-30 hidden h-full w-[min(18vw,7rem)] items-center justify-start pl-2 transition-opacity md:flex",
            canGoPrev ? "opacity-0 hover:opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <span className="rounded-full bg-black/35 p-2 text-white/80 backdrop-blur-sm">
            <ChevronLeft className="h-6 w-6" />
          </span>
        </button>
        <button
          type="button"
          aria-label="Next slide"
          disabled={!canGoNext}
          onClick={goNext}
          className={cn(
            "absolute right-0 top-0 z-30 hidden h-full w-[min(18vw,7rem)] items-center justify-end pr-2 transition-opacity md:flex",
            canGoNext ? "opacity-0 hover:opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          <span className="rounded-full bg-black/35 p-2 text-white/80 backdrop-blur-sm">
            <ChevronRight className="h-6 w-6" />
          </span>
        </button>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-4 sm:px-8 sm:py-6">
          <AnimatePresence mode="wait">
            {phase === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.97, filter: "blur(6px)" }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="flex max-w-2xl flex-col items-center text-center"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.6, filter: "blur(12px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
                  className="relative"
                >
                  <motion.div
                    className="absolute inset-0 -m-8 rounded-full bg-[#F4C542]/20 blur-3xl"
                    animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.9, 1.1, 0.9] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  />
                  <GoalGhostLogo size={120} className="relative" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 1.2 }}
                  className="mt-12 font-display text-2xl leading-relaxed text-white/90 sm:text-3xl md:text-4xl"
                >
                  Your tournament is over.
                  <br />
                  <span className="text-[#F4C542]">But your legacy has just begun.</span>
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="mt-8 text-sm text-muted/70"
                >
                  Use the controls below to play, pause, or skip chapters
                </motion.p>
              </motion.div>
            )}

            {chapter && (
              <motion.div
                key={chapter.id}
                initial={{ opacity: 0, y: 36, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -24, scale: 0.99, filter: "blur(4px)" }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "w-full max-w-3xl rounded-3xl border border-[#F4C542]/20 bg-gradient-to-br p-6 shadow-2xl shadow-black/40 sm:p-10 md:p-12",
                  chapter.accent
                )}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#F4C542]/90">
                  Chapter · {chapter.title}
                </p>
                <h2 className="mt-4 font-display text-3xl text-white/95 sm:text-4xl md:text-5xl">
                  {chapter.subtitle}
                </h2>

                {chapter.id === "birth" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.25 }}
                    className="mt-8 flex flex-wrap items-center gap-5"
                  >
                    <GhostAvatar
                      name={ghost.name}
                      team={ghost.team}
                      teamCode={teamCode}
                      mood={ghost.mood}
                      evolutionScore={ghost.evolutionScore}
                      confidence={ghost.confidence}
                      memories={ghost.memories}
                      identity={identity}
                      size={96}
                      animate
                    />
                    <NationFlagEmoji
                      name={ghost.team}
                      code={teamCode}
                      size={56}
                      className="rounded-xl shadow-lg shadow-[#F4C542]/15"
                    />
                    <div>
                      <p className="font-display text-3xl text-[#F4C542]">{ghost.name}</p>
                      <p className="mt-1 text-sm text-muted/80">{ghost.team} Spirit</p>
                    </div>
                  </motion.div>
                )}

                {chapter.id === "evolution" && (
                  <div className="mt-8">
                    <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#F4C542]/50 to-[#F4C542]"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ghost.evolutionScore)}%` }}
                        transition={{ duration: 1.8, ease: "easeOut" }}
                      />
                    </div>
                    <div className="mt-6 flex justify-between gap-2">
                      {evolutionArc.map((stage, i) => (
                        <motion.div
                          key={stage}
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.35 + i * 0.18 }}
                          className="flex flex-1 flex-col items-center gap-2"
                        >
                          <div className="h-3 w-3 rounded-full bg-[#F4C542] shadow shadow-[#F4C542]/40" />
                          <span className="text-center text-[9px] uppercase tracking-wider text-[#F4C542]/80 sm:text-[10px]">
                            {stage}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {chapter.quotes && chapter.quotes.length > 0 && (
                  <div
                    className={cn(
                      "mt-8 space-y-3",
                      chapter.id === "journey" && "mt-10 space-y-4 sm:mt-8 sm:space-y-3"
                    )}
                  >
                    <p className="text-[10px] uppercase tracking-[0.3em] text-[#F4C542]/70">
                      Your signed words
                    </p>
                    {chapter.quotes.map((q, i) => (
                      <motion.blockquote
                        key={`${q.quote.slice(0, 24)}-${i}`}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.12 + i * 0.1 }}
                        className="rounded-2xl border border-[#F4C542]/15 bg-[#0A1020]/55 px-5 py-4"
                      >
                        <ReadMoreText
                          className="text-sm italic leading-relaxed text-white/90"
                          collapsedLines={3}
                          onToggle={pauseReading}
                        >
                          {`\u201C${legacyDisplayText(q.quote)}\u201D`}
                        </ReadMoreText>
                        <p className="mt-2 text-[10px] uppercase tracking-wider text-muted/60">
                          {legacyDisplayText(q.context)}
                        </p>
                      </motion.blockquote>
                    ))}
                  </div>
                )}

                {chapter.moments && (
                  <div
                    className={cn(
                      "mt-8 grid gap-3 sm:grid-cols-3",
                      chapter.id === "journey" && "mt-10 gap-4 sm:mt-8 sm:gap-3"
                    )}
                  >
                    {chapter.moments.map((moment, i) => (
                      <motion.div
                        key={moment.title}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.18 + i * 0.12 }}
                        className="rounded-2xl border border-white/8 bg-[#0A1020]/50 p-4"
                      >
                        <span className="text-xl">{moment.emoji}</span>
                        <p className="mt-2 text-sm font-semibold text-white/90">{moment.title}</p>
                        <ReadMoreText
                          className="mt-1 text-xs leading-relaxed text-muted/80"
                          collapsedLines={3}
                          onToggle={pauseReading}
                        >
                          {moment.body}
                        </ReadMoreText>
                      </motion.div>
                    ))}
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className={cn("mt-8", chapter.id === "journey" && "mt-10 sm:mt-8")}
                >
                  <ReadMoreText
                    className="text-base leading-relaxed text-white/82 sm:text-lg"
                    onToggle={pauseReading}
                  >
                    {chapter.body}
                  </ReadMoreText>
                </motion.div>

                {chapter.stats && (
                  <div
                    className={cn(
                      "mt-8 flex flex-wrap gap-8",
                      chapter.id === "journey" && "mt-10 gap-10 sm:mt-8 sm:gap-8"
                    )}
                  >
                    {chapter.stats.map((stat) => (
                      <div key={stat.label}>
                        <p className="font-display text-3xl text-[#F4C542] sm:text-4xl">
                          {stat.value}
                        </p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted/70">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {phase === "finale" && (
              <motion.div
                key="finale"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-3xl text-center"
              >
                <p className="text-[11px] uppercase tracking-[0.35em] text-[#F4C542]/80">
                  The closing ceremony
                </p>
                <h2 className="mt-4 font-display text-4xl text-white sm:text-5xl md:text-6xl">
                  {ghost.name}&apos;s Legacy
                </h2>
                <motion.p
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 }}
                  className="mt-6 font-display text-4xl uppercase tracking-wide text-[#F4C542] sm:text-5xl md:text-7xl"
                >
                  {legacyDisplayText(legacy.stats.dominantMood)}
                </motion.p>
                <p className="mt-2 text-sm uppercase tracking-[0.25em] text-muted/70">
                  Dominant Spirit
                </p>
                <div className="mx-auto mt-8 max-w-xl text-left">
                  <ReadMoreText
                    className="text-base leading-relaxed text-white/80 sm:text-lg"
                    onToggle={pauseReading}
                  >
                    {legacyDisplayText(legacy.story)}
                  </ReadMoreText>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {(legacy.wrappedStats?.length
                    ? legacy.wrappedStats
                    : [
                        {
                          value: String(legacy.stats.peakEvolution),
                          label: "Evolution",
                          insight: "",
                        },
                        {
                          value: String(legacy.stats.matchesWitnessed),
                          label: "Chapters",
                          insight: "",
                        },
                        { value: ghost.team, label: "Nation", insight: "" },
                        {
                          value: legacyDisplayText(legacy.stats.dominantMood),
                          label: "Spirit",
                          insight: "",
                        },
                      ]
                  ).map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + i * 0.08 }}
                      className="rounded-2xl border border-[#F4C542]/15 bg-[#0A1020]/60 px-3 py-5 text-left"
                    >
                      <p className="font-display text-2xl text-[#F4C542] sm:text-3xl">{stat.value}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-muted/70">
                        {stat.label}
                      </p>
                      {"insight" in stat && stat.insight ? (
                        <ReadMoreText
                          className="mt-2 text-[11px] leading-relaxed text-muted/65"
                          collapsedLines={3}
                          maxChars={120}
                          onToggle={pauseReading}
                        >
                          {legacyDisplayText(stat.insight)}
                        </ReadMoreText>
                      ) : null}
                    </motion.div>
                  ))}
                </div>

                {legacy.interactionQuotes && legacy.interactionQuotes.length > 0 && (
                  <div className="mx-auto mt-8 max-w-xl space-y-2 text-left">
                    <p className="text-center text-[10px] uppercase tracking-[0.3em] text-[#F4C542]/70">
                      Quoted from your journey
                    </p>
                    {legacy.interactionQuotes.slice(0, 2).map((q, i) => (
                      <div
                        key={`finale-quote-${i}`}
                        className="rounded-xl border border-white/8 bg-white/5 px-4 py-3"
                      >
                        <ReadMoreText
                          className="text-sm italic text-white/85"
                          collapsedLines={3}
                          onToggle={pauseReading}
                        >
                          {`\u201C${legacyDisplayText(q.quote)}\u201D`}
                        </ReadMoreText>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-10 flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row">
                  <Button
                    size="lg"
                    onClick={onShare}
                    className="min-w-[220px] shadow-lg shadow-[#F4C542]/25"
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    {shareCopied ? "Copied!" : "Share Your Legacy"}
                  </Button>
                  {!readOnly && onSeal && !sealed && (
                    <Button
                      size="lg"
                      variant="outline"
                      disabled={sealing}
                      onClick={() => void onSeal()}
                      className="min-w-[220px] border-[#F4C542]/30"
                    >
                      {sealing ? "Sealing to 0G…" : "Seal to 0G Storage"}
                    </Button>
                  )}
                  {sealed && (
                    <p className="text-xs text-emerald-400/90">Sealed on 0G Storage</p>
                  )}
                </div>

                <div className="mt-6 flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row">
                  <Button variant="ghost" size="sm" onClick={replay}>
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    Replay the Journey
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      downloadLegacyFinaleImage({
                        ghostName: ghost.name,
                        team: ghost.team,
                        legacy,
                      })
                    }
                  >
                    <Download className="mr-1.5 h-3.5 w-3.5" />
                    Download as Image
                  </Button>
                  {onComplete && (
                    <Button variant="outline" size="sm" onClick={exitCinematic}>
                      Continue to Comments
                      <ChevronRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom transport controls */}
      <div className="relative z-20 shrink-0 border-t border-white/6 bg-[#0A1020]/90 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-lg items-center justify-center gap-4">
          <button
            type="button"
            onClick={goPrev}
            disabled={!canGoPrev}
            aria-label="Previous slide"
            className={cn(
              "rounded-full border border-white/10 p-3 transition-all",
              canGoPrev
                ? "text-white/85 hover:border-[#F4C542]/35 hover:bg-white/5 hover:text-[#F4C542]"
                : "cursor-not-allowed text-white/20"
            )}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F4C542] text-[#0A1020] shadow-lg shadow-[#F4C542]/30 transition-transform hover:scale-105 active:scale-95"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="ml-0.5 h-6 w-6" />}
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            aria-label="Next slide"
            className={cn(
              "rounded-full border border-white/10 p-3 transition-all",
              canGoNext
                ? "text-white/85 hover:border-[#F4C542]/35 hover:bg-white/5 hover:text-[#F4C542]"
                : "cursor-not-allowed text-white/20"
            )}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-center text-[10px] uppercase tracking-wider text-muted/45">
          Arrow keys to navigate · Space to play/pause · Esc to exit
        </p>
      </div>
    </section>
  );

  if (!mounted) return null;
  return createPortal(content, document.body);
}