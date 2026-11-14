/** How far a loop jumps where it wraps: the biggest step, over every channel, from the last sample back to the first. */
export function loopJumpOf(channels: readonly Float32Array[]): number {
  let jump = 0;
  for (const samples of channels) {
    const first = samples[0];
    const last = samples[samples.length - 1];
    if (first === undefined || last === undefined) {
      continue;
    }
    jump = Math.max(jump, Math.abs(first - last));
  }

  return jump;
}
