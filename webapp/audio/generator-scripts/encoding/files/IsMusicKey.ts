/** Whether a cue is a music loop, which is judged at its join. Effects do not loop. */
export function isMusicKey(key: string): boolean {
  return key.startsWith("music-");
}
