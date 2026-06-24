"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export type LegacyCinematicAudioHandle = {
  start: () => void;
  setMuted: (muted: boolean) => void;
};

const MASTER_GAIN = 0.28;

function createCrowdBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let last = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    last = last * 0.96 + white * 0.12;
    data[i] = last;
  }
  return buffer;
}

export const LegacyCinematicAudio = forwardRef<
  LegacyCinematicAudioHandle,
  { muted?: boolean }
>(function LegacyCinematicAudio({ muted = false }, ref) {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const mutedRef = useRef(muted);
  const startedRef = useRef(false);
  const stopSourcesRef = useRef<(() => void) | null>(null);

  const applyGain = useCallback(() => {
    const master = masterGainRef.current;
    const ctx = ctxRef.current;
    if (!master || !ctx) return;
    const target = mutedRef.current ? 0 : MASTER_GAIN;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(target, ctx.currentTime, 0.12);
  }, []);

  const start = useCallback(() => {
    if (startedRef.current && ctxRef.current) {
      void ctxRef.current.resume().then(applyGain);
      return;
    }
    if (startedRef.current) return;
    startedRef.current = true;

    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    masterGainRef.current = master;
    master.connect(ctx.destination);

    const crowd = ctx.createBufferSource();
    crowd.buffer = createCrowdBuffer(ctx);
    crowd.loop = true;

    const crowdFilter = ctx.createBiquadFilter();
    crowdFilter.type = "bandpass";
    crowdFilter.frequency.value = 280;
    crowdFilter.Q.value = 0.6;

    const crowdGain = ctx.createGain();
    crowdGain.gain.value = 0.55;
    crowd.connect(crowdFilter);
    crowdFilter.connect(crowdGain);
    crowdGain.connect(master);
    crowd.start();

    const padFreqs = [55, 82.41, 110, 164.81];
    const padOscillators: OscillatorNode[] = [];
    padFreqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      gain.gain.value = 0.045 / (i + 1);
      osc.connect(gain);
      gain.connect(master);
      osc.start();
      padOscillators.push(osc);
    });

    const chant = ctx.createOscillator();
    chant.type = "triangle";
    chant.frequency.value = 130.81;
    const chantGain = ctx.createGain();
    chantGain.gain.value = 0;
    chant.connect(chantGain);
    chantGain.connect(master);

    const chantPulse = ctx.createOscillator();
    chantPulse.type = "sine";
    chantPulse.frequency.value = 0.25;
    const chantMod = ctx.createGain();
    chantMod.gain.value = 0.03;
    chantPulse.connect(chantMod);
    chantMod.connect(chantGain.gain);
    chant.start();
    chantPulse.start();

    stopSourcesRef.current = () => {
      try {
        crowd.stop();
      } catch {
        /* already stopped */
      }
      padOscillators.forEach((osc) => {
        try {
          osc.stop();
        } catch {
          /* already stopped */
        }
      });
      try {
        chant.stop();
        chantPulse.stop();
      } catch {
        /* already stopped */
      }
    };

    void ctx.resume().then(() => {
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.01);
      applyGain();
    });
  }, [applyGain]);

  useImperativeHandle(
    ref,
    () => ({
      start,
      setMuted: (next: boolean) => {
        mutedRef.current = next;
        applyGain();
      },
    }),
    [start, applyGain]
  );

  useEffect(() => {
    mutedRef.current = muted;
    applyGain();
  }, [muted, applyGain]);

  useEffect(() => {
    return () => {
      stopSourcesRef.current?.();
      stopSourcesRef.current = null;
      if (ctxRef.current) {
        void ctxRef.current.close();
        ctxRef.current = null;
      }
      masterGainRef.current = null;
      startedRef.current = false;
    };
  }, []);

  return null;
});