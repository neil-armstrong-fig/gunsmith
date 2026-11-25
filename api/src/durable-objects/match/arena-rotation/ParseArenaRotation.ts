/**
 * Whether a room offers only the day's built-in arenas (the rotation), from what the first page to reach it showed: `?arenaRotation=off`
 * offers every one, so a room with no time to choose begins on the Duel whatever the date. A tuning seam like `?startSeed=`, so a spec's
 * room does not depend on the day; such a room counts no plays either, or spec runs would decide the day's arenas. Anything but exactly
 * `off` keeps the rotation.
 */
export function parseArenaRotation(search: URLSearchParams): boolean {
  return search.get("arenaRotation") !== "off";
}
