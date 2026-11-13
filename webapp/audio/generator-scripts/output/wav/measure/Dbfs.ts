/** The silence floor, as a share of full scale: -180 dBFS, far below anything a 16-bit file can hold. */
const FLOOR = 1e-9;

/** An amplitude as a share of full scale, in decibels below it, to two places. Silence reads -180 rather than minus infinity. */
export function dbfs(amplitude: number): number {
  return Number((20 * Math.log10(Math.max(amplitude, FLOOR))).toFixed(2));
}
