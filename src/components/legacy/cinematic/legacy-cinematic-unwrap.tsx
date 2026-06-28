"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/lib/motion";
import {
  Download,
  RotateCcw,
  Share2,
  ChevronRight,
  Volume2,
  VolumeX,
  X,
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

const FINALE_AUTO_EXIT_MS = 14_000;

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
  const [phase, setPhase] = useState<Phase>("intro");
  const [showConfetti, setShowConfetti] = useState(false);
  const [audioOn, setAudioOn] = useState(true);
  const [finaleEngaged, setFinaleEngaged] = useState(false);
  const audioRef = useRef<LegacyCinematicAudioHandle>(null);
  const finaleEngagedRef = useRef(false);
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

  const advance = useCallback(() => {
    ensureAudio();
    setPhase((current) => {
      const idx = PHASE_ORDER.indexOf(current);
      const next = PHASE_ORDER[Math.min(idx + 1, PHASE_ORDER.length - 1)];
      if (next === "finale") {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      return next;
    });
  }, [ensureAudio]);

  const replay = useCallback(() => {
    finaleEngagedRef.current = true;
    setFinaleEngaged(true);
    ensureAudio();
    setPhase("intro");
    setShowConfetti(false);
  }, [ensureAudio]);

  const markFinaleEngaged = useCallback(() => {
    finaleEngagedRef.current = true;
    setFinaleEngaged(true);
  }, []);

  useEffect(() => {
    if (phase === "finale") return;
    const ms = PHASE_DWELL_MS[phase];
    const t = setTimeout(advance, ms);
    return () => clearTimeout(t);
  }, [phase, advance]);

  useEffect(() => {
    if (phase !== "finale" || !onComplete) return;
    finaleEngagedRef.current = false;
    setFinaleEngaged(false);
    const t = setTimeout(() => {
      if (!finaleEngagedRef.current) onComplete();
    }, FINALE_AUTO_EXIT_MS);
    return () => clearTimeout(t);
  }, [phase, onComplete]);

  useEffect(() => {
    audioRef.current?.setMuted(!audioOn);
  }, [audioOn]);

  const chapter = chapters.find((c) => c.id === phase);

  return (
    <section
      className="relative isolate min-h-[100dvh] w-full overflow-hidden rounded-3xl border border-[#F4C542]/20 bg-[#0A1020] text-foreground shadow-2xl shadow-[#F4C542]/10"
      role="region"
      aria-label="Legacy unwrap ceremony"
      onPointerDown={ensureAudio}
      onClick={() => phase !== "finale" && advance()}
    >
      <ConfettiCelebration active={showConfetti} duration={5000} />
      <LegacyCinematicAudio ref={audioRef} muted={!audioOn} />
      <LegacyCinematicBackdrop intense={phase === "finale" || phase === "legacy"} />
      <LegacyCinematicParticles active={phase !== "intro"} count={phase === "finale" ? 40 : 24} />

      <div className="relative z-10 flex items-center justify-between px-5 pt-5 sm:px-8">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#F4C542]/70">
          GoalGhost Spirit Legacy
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              ensureAudio();
              setAudioOn((v) => {
                const next = !v;
                audioRef.current?.setMuted(!next);
                return next;
              });
            }}
            className="rounded-lg p-2 text-muted/60 transition-colors duration-200 hover:bg-white/5 hover:text-[#F4C542]"
            aria-label={audioOn ? "Mute ambience" : "Enable ambience"}
            title={audioOn ? "Mute stadium ambience" : "Enable stadium ambience"}
          >
            {audioOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              exitCinematic();
            }}
            className="rounded-lg p-2 text-muted/60 transition-colors duration-200 hover:bg-white/5 hover:text-white"
            aria-label="Exit cinematic"
            title="Exit cinematic"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative z-10 flex min-h-[calc(100dvh-7rem)] flex-col items-center justify-center px-6 pb-8 sm:px-10">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 1.2 }}
              className="flex max-w-2xl flex-col items-center text-center"
              onClick={(e) => e.stopPropagation()}
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
                transition={{ delay: 1.4, duration: 1.4 }}
                className="mt-12 font-display text-2xl leading-relaxed text-white/90 sm:text-3xl md:text-4xl"
              >
                Your tournament is over.
                <br />
                <span className="text-[#F4C542]">
                  But your legacy has just begun.
                </span>
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.6, duration: 1 }}
                className="mt-8 text-sm text-muted/70"
              >
                Tap or wait to begin your Spirit journey
              </motion.p>
            </motion.div>
          )}

          {chapter && (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "w-full max-w-3xl rounded-3xl border border-[#F4C542]/20 bg-gradient-to-br p-8 sm:p-12",
                chapter.accent
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#F4C542]/90">
                Chapter · {chapter.title}
              </p>
              <h2 className="mt-4 font-display text-4xl text-white/95 sm:text-5xl">
                {chapter.subtitle}
              </h2>

              {chapter.id === "birth" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-8 flex items-center gap-5"
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
                        transition={{ delay: 0.4 + i * 0.2 }}
                        className="flex flex-1 flex-col items-center gap-2"
                      >
                        <div
                          className={cn(
                            "h-3 w-3 rounded-full",
                            i <= evolutionArc.length - 1
                              ? "bg-[#F4C542] shadow shadow-[#F4C542]/40"
                              : "bg-white/15"
                          )}
                        />
                        <span className="text-center text-[9px] uppercase tracking-wider text-[#F4C542]/80 sm:text-[10px]">
                          {stage}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {chapter.moments && (
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {chapter.moments.map((moment, i) => (
                    <motion.div
                      key={moment.title}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.15 }}
                      className="rounded-2xl border border-white/8 bg-[#0A1020]/50 p-4"
                    >
                      <span className="text-xl">{moment.emoji}</span>
                      <p className="mt-2 text-sm font-semibold text-white/90">
                        {moment.title}
                      </p>
                      <ReadMoreText
                        className="mt-1 text-xs leading-relaxed text-muted/80"
                        collapsedLines={3}
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
                transition={{ delay: 0.45 }}
                className="mt-8"
              >
                <ReadMoreText className="text-base leading-relaxed text-white/82 sm:text-lg">
                  {chapter.body}
                </ReadMoreText>
              </motion.div>

              {chapter.stats && (
                <div className="mt-8 flex flex-wrap gap-8">
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
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="w-full max-w-3xl text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-[11px] uppercase tracking-[0.35em] text-[#F4C542]/80">
                The closing ceremony
              </p>
              <h2 className="mt-4 font-display text-5xl text-white sm:text-6xl md:text-7xl">
                {ghost.name}&apos;s Legacy
              </h2>
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 font-display text-5xl uppercase tracking-wide text-[#F4C542] sm:text-6xl md:text-8xl"
              >
                {legacyDisplayText(legacy.stats.dominantMood)}
              </motion.p>
              <p className="mt-2 text-sm uppercase tracking-[0.25em] text-muted/70">
                Dominant Spirit
              </p>
              <div className="mx-auto mt-8 max-w-xl">
                <ReadMoreText className="text-base leading-relaxed text-white/80 sm:text-lg">
                  {legacyDisplayText(legacy.story)}
                </ReadMoreText>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4">
                {[
                  { value: String(legacy.stats.peakEvolution), label: "Evolution" },
                  { value: String(legacy.stats.matchesWitnessed), label: "Chapters" },
                  { value: ghost.team, label: "Nation" },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="rounded-2xl border border-[#F4C542]/15 bg-[#0A1020]/60 px-3 py-5"
                  >
                    <p className="font-display text-3xl text-[#F4C542] sm:text-4xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-muted/70">
                      {stat.label}
                    </p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 flex flex-col flex-wrap items-center justify-center gap-3 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => {
                    markFinaleEngaged();
                    onShare();
                  }}
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
                    onClick={() => {
                      markFinaleEngaged();
                      void onSeal();
                    }}
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
                  onClick={() => {
                    markFinaleEngaged();
                    downloadLegacyFinaleImage({
                      ghostName: ghost.name,
                      team: ghost.team,
                      legacy,
                    });
                  }}
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Download as Image
                </Button>
                {onComplete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      markFinaleEngaged();
                      exitCinematic();
                    }}
                  >
                    Continue to Comments
                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {onComplete && !finaleEngaged && (
                <p className="mt-5 text-[10px] uppercase tracking-wider text-muted/45">
                  Returning to your legacy page shortly · or scroll for comments
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10 px-6 pb-6">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          {PHASE_ORDER.map((p) => {
            const idx = PHASE_ORDER.indexOf(phase);
            const pIdx = PHASE_ORDER.indexOf(p);
            const active = pIdx <= idx;
            return (
              <div
                key={p}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all duration-500",
                  active ? "bg-[#F4C542]" : "bg-white/10"
                )}
              />
            );
          })}
        </div>
        {phase !== "finale" && (
          <p className="mt-3 text-center text-[10px] uppercase tracking-wider text-muted/50">
            Tap anywhere to continue · scroll anytime for comments
          </p>
        )}
      </div>
    </section>
  );
}