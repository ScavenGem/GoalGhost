export type ComputeFallbackTask = "create" | "evolve" | "legacy";

const HEADLINES: Record<ComputeFallbackTask, string> = {
  create: "Your Spirit was drafted from your choices",
  evolve: "Your evolution chapter was composed from your journey",
  legacy: "Your legacy was wrapped from your fan journey",
};

const BODIES: Record<ComputeFallbackTask, string> = {
  create:
    "Live intelligence wasn't available just now, so we shaped this identity from your nation and trait sliders. You can still seal and mint — your GoalGhost is yours on 0G Storage.",
  evolve:
    "Live intelligence wasn't available just now, so this chapter was narrated from your indexed comments, reactions, and match moments. It still seals to 0G Storage as usual.",
  legacy:
    "Live intelligence wasn't available just now, so your unwrap was composed from your signed banter, reactions, and evolution chapters. The ceremony can still continue.",
};

/** Short phrase for inline fallback narrative copy (backstory, story, etc.). */
export const FALLBACK_NARRATIVE_NOTE =
  "Shaped from your verified fan journey so the ritual could continue without waiting.";

export function computeFallbackHeadline(task: ComputeFallbackTask): string {
  return HEADLINES[task];
}

export function computeFallbackBody(task: ComputeFallbackTask): string {
  return BODIES[task];
}

export function computeFallbackUserNotice(
  task: ComputeFallbackTask,
  _reason?: string
): string {
  return `${computeFallbackHeadline(task)}. ${computeFallbackBody(task)}`;
}