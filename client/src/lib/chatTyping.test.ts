import { describe, expect, it } from "vitest";
import { MIN_TYPING_DURATION_MS, remainingTypingDuration } from "./chatTyping";

describe("typing feedback timing", () => {
  it("keeps feedback visible until the minimum perceived-response duration", () => {
    expect(remainingTypingDuration(1_000, 1_000)).toBe(MIN_TYPING_DURATION_MS);
    expect(remainingTypingDuration(1_000, 1_200)).toBe(MIN_TYPING_DURATION_MS - 200);
  });

  it("does not add a delay after the minimum time has passed", () => {
    expect(remainingTypingDuration(1_000, 2_000)).toBe(0);
  });
});
