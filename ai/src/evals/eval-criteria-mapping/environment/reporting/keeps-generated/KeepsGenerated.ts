/**
 * Whether a run keeps what its model generated (drawings, arenas) for a person to look at. Each tier's driver says what it does by
 * default: the local tier keeps, because a real model's work is worth judging and costs nothing; the fake tier's canned answers and
 * the paid tier, which is chosen and costs money, do not. A setting of `1` or `0` overrides it; anything else is ignored.
 */
export function keepsGenerated(setting: string | undefined, byDefault: boolean): boolean {
  if (setting === "1") {
    return true;
  }

  if (setting === "0") {
    return false;
  }

  return byDefault;
}
