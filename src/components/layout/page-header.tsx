"use client";

import { motion } from "@/lib/motion";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      <p className="text-xs uppercase tracking-[0.35em] text-[#F4C542]">{eyebrow}</p>
      <h1 className="font-display text-4xl leading-tight md:text-5xl">{title}</h1>
      <p className="max-w-lg leading-relaxed text-muted">{description}</p>
    </motion.div>
  );
}