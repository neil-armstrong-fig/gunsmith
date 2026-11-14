/** The keys that crouch, as `KeyboardEvent.code`s: C or either Control key (`docs/game-design.md`). */
const CROUCH_KEYS = ["KeyC", "ControlLeft", "ControlRight"] as const;

/** Whether a crouch key is among the held keys. */
export function crouchHeld(heldKeys: ReadonlySet<string>): boolean {
  return CROUCH_KEYS.some(key => heldKeys.has(key));
}
