"use client";

import { motion } from "@/lib/motion";

export function AmbientGlow() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-gold/8 blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, 20, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 bottom-32 h-80 w-80 rounded-full bg-sky-500/6 blur-[100px]"
        animate={{ x: [0, -30, 0], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(244,197,66,0.06)_0%,_transparent_55%)]" />
    </div>
  );
}