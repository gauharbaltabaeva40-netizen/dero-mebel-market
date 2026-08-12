/**
 * A null upper bound represents the unfiltered initial catalog state.
 * Keeping this rule pure makes it safe to verify without a browser.
 */
export function isWithinPriceLimit(basePriceKzt: number, maxPrice: number | null): boolean {
  return maxPrice === null || basePriceKzt <= maxPrice;
}
