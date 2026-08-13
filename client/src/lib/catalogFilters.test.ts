import { describe, expect, it } from "vitest";
import { isWithinDimensionRange, isWithinPriceLimit } from "./catalogFilters";

describe("isWithinPriceLimit", () => {
  it("includes every catalog price when no maximum is selected", () => {
    expect(isWithinPriceLimit(199_999, null)).toBe(true);
    expect(isWithinPriceLimit(850_000, null)).toBe(true);
  });

  it("applies a selected maximum inclusively", () => {
    expect(isWithinPriceLimit(500_000, 500_000)).toBe(true);
    expect(isWithinPriceLimit(500_001, 500_000)).toBe(false);
  });

  it("keeps a product only when every selected dimension lies within its inclusive range", () => {
    const widthRange = [1_800, 2_000] as const;
    const heightRange = [2_100, 2_500] as const;
    const depthRange = [550, 650] as const;

    expect(isWithinDimensionRange(1_800, widthRange)).toBe(true);
    expect(isWithinDimensionRange(2_000, widthRange)).toBe(true);
    expect(isWithinDimensionRange(1_799, widthRange)).toBe(false);
    expect(isWithinDimensionRange(2_501, heightRange)).toBe(false);
    expect(isWithinDimensionRange(600, depthRange)).toBe(true);
  });

  it("does not hide products until a size range is selected and excludes unknown selected dimensions", () => {
    expect(isWithinDimensionRange(null, null)).toBe(true);
    expect(isWithinDimensionRange(null, [500, 700])).toBe(false);
  });
});
