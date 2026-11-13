/** Which way a hi-hat step is placed: even steps left and odd steps right, so the hats ping-pong across the stereo field. */
export function hatPan(step: number): number {
  if (step % 2 === 0) {
    return -0.32;
  }

  return 0.32;
}
