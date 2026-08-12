import { describe, expect, it } from "vitest";
import { isWithinPriceLimit } from "./catalogFilters";

describe("isWithinPriceLimit", () => {
  it("includes every catalog price when no maximum is selected", () => {
    expect(isWithinPriceLimit(199_999, null)).toBe(true);
    expect(isWithinPriceLimit(850_000, null)).toBe(true);
  });

  it("applies a selected maximum inclusively", () => {
    expect(isWithinPriceLimit(500_000, 500_000)).toBe(true);
    expect(isWithinPriceLimit(500_001, 500_000)).toBe(false);
  });
});
