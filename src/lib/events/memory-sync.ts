export const MEMORY_ADDED_EVENT = "goalghost:memory-added";

export function notifyMemoryAdded(detail?: { matchId?: string; eventId?: string }) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(MEMORY_ADDED_EVENT, { detail }));
}