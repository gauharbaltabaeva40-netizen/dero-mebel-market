/**
 * A null upper bound represents the unfiltered initial catalog state.
 * Keeping this rule pure makes it safe to verify without a browser.
 */
export function isWithinPriceLimit(basePriceKzt: number, maxPrice: number | null): boolean {
  return maxPrice === null || basePriceKzt <= maxPrice;
}

export type DimensionRange = readonly [number, number] | null;
export type DimensionUnit = "mm" | "cm";

/** Only an explicit unavailable status excludes a made-to-order model from the availability filter. */
export function isAvailableForOrder(status: "in_stock" | "made_to_order" | "unavailable" | null | undefined): boolean {
  return status !== "unavailable";
}

export function fromMillimeters(valueMm: number, unit: DimensionUnit): number {
  return unit === "cm" ? Math.round(valueMm / 10) : valueMm;
}

export function toMillimeters(value: number, unit: DimensionUnit): number {
  return unit === "cm" ? value * 10 : value;
}

/** A selected size range excludes products without the corresponding recorded dimension. */
export function isWithinDimensionRange(valueMm: number | null, range: DimensionRange): boolean {
  return range === null || (valueMm !== null && valueMm >= range[0] && valueMm <= range[1]);
}
