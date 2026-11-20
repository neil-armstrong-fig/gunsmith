import type {SeedMaker} from "@src/durable-objects/match/room/types/SeedMaker";

/**
 * The seed a page pins for its room's fair starts (`?startSeed=`), as a tuning seam so a spec starts the two fighters on known
 * places, like `?reconnectSeconds=`: every round of that room then starts on the same pair. It is `undefined` unless the query
 * holds a whole number, and the room then draws its own for each round. The query is `unknown` text until read here.
 */
export function parseStartSeed(search: URLSearchParams): SeedMaker | undefined {
  const asked = search.get("startSeed") ?? "";
  const seed = Number(asked);
  if (asked.trim() === "" || !Number.isSafeInteger(seed)) {
    return undefined;
  }

  return () => seed;
}
