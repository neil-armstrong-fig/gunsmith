/**
 * Whether a player's text frame is a `ready` message: the player asking to go on to the next round (or a fresh match) once a round
 * is decided. It carries nothing else, so the answer is a yes or a no. Everything a client sends is `unknown` until here.
 */
export function parseReadyMessage(text: string): boolean {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return false;
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return false;
  }

  return Reflect.get(parsed, "kind") === "ready";
}
