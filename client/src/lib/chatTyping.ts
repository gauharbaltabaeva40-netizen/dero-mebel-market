export const MIN_TYPING_DURATION_MS = 520;

/** Keeps the typing feedback visible long enough to be perceived without slowing the chat unnecessarily. */
export function remainingTypingDuration(startedAt: number, now = Date.now()): number {
  return Math.max(0, MIN_TYPING_DURATION_MS - (now - startedAt));
}
