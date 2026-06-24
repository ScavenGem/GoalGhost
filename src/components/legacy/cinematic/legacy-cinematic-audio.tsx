"use client";

import { useEffect, useRef } from "react";

/**
 * Procedural low-volume stadium ambience and soft cinematic pad.
 * No external audio files required.
 */
export function LegacyCinematicAudio({ enabled = true }: { enabled?: boolean }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    function start() {
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
      master.gain.value = 0.12;
      master.connect(ctx.destination);

      const crowd = ctx.createBufferSource();
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.08;
      }
      crowd.buffer = buffer;
      crowd.loop = true;

      const crowdFilter = ctx.createBiquadFilter();
      crowdFilter.type = "lowpass";
      crowdFilter.frequency.value = 420;

      const crowdGain = ctx.createGain();
      crowdGain.gain.value = 0.35;
      crowd.connect(crowdFilter);
      crowdFilter.connect(crowdGain);
      crowdGain.connect(master);
      crowd.start();

      const padFreqs = [110, 164.81, 220];
      padFreqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.value = 0.04 / (i + 1);
        osc.connect(gain);
        gain.connect(master);
        osc.start();
      });

      void ctx.resume();
    }

    const onInteract = () => {
      start();
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
    };

    window.addEventListener("pointerdown", onInteract);
    window.addEventListener("keydown", onInteract);

    return () => {
      window.removeEventListener("pointerdown", onInteract);
      window.removeEventListener("keydown", onInteract);
      if (ctxRef.current) {
        void ctxRef.current.close();
        ctxRef.current = null;
      }
      startedRef.current = false;
    };
  }, [enabled]);

  return null;
}