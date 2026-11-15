/** What the ring's countdown says: the time left before it starts, or that it is closing once that time is up. */
export function countdownText(secondsUntilStart: number): string {
  if (secondsUntilStart <= 0) {
    return "Ring closing";
  }

  const minutes = Math.floor(secondsUntilStart / 60);
  const seconds = String(secondsUntilStart % 60).padStart(2, "0");

  return `Ring in ${minutes}:${seconds}`;
}
