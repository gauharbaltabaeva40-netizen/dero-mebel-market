/** Format KZT price like "420 000 ₸" */
export function fmtPrice(v: number | null | undefined): string {
  if (v == null) return "—";
  return Math.round(v).toLocaleString("ru-RU") + " ₸";
}

/** Dimension string from mm values */
export function fmtDims(w?: number | null, h?: number | null, d?: number | null): string {
  const parts = [w, h, d].filter((x) => x != null).map((x) => `${Math.round(x! / 100 / 10)} см`);
  return parts.join(" × ") || "—";
}
