// Pure helpers for tutor session persistence/rehydration. Kept free of DB and
// Express so they can be unit-tested directly.

export type Level = "new" | "experienced";

export interface StoredMessage {
  role: string;
  content: string;
}

/**
 * Control turns the UI sends but never shows as a user bubble. On rehydration
 * we hide these user rows so a reloaded session looks exactly like a live one.
 */
export const CONTROL_PREFIXES = ["[BEGIN SESSION]", "[HINT]", "[SIMPLIFY]", "[SYNTHESIS]"] as const;

export function isControlUserMessage(content: string): boolean {
  return CONTROL_PREFIXES.some((p) => content.startsWith(p));
}

/** A learner "exchange" = a real (non-control) user message. */
export function countExchanges(messages: StoredMessage[]): number {
  return messages.filter((m) => m.role === "user" && !isControlUserMessage(m.content)).length;
}

/**
 * Messages to render on rehydration: drop control user turns, keep everything
 * the learner actually saw (assistant replies + their own typed answers).
 */
export function visibleMessages<T extends StoredMessage>(messages: T[]): T[] {
  return messages.filter((m) => !(m.role === "user" && isControlUserMessage(m.content)));
}

/** Conversation titles are stored as `${topicTitle} — ${levelLabel}`. */
export function parseTitle(title: string): { topicTitle: string; level: Level } {
  const parts = title.split(" — ");
  const topicTitle = parts[0] ?? "";
  const levelLabel = parts[1] ?? "New caregiver";
  return { topicTitle, level: levelLabel === "Experienced" ? "experienced" : "new" };
}
