/**
 * The arena every private room is played in for now: the webapp's duel arena (`webapp/src/game/duel/DuelArena.ts`), copied
 * because `api/` imports nothing from the webapp. The layout is sent to each seat when it joins; it is not a secret.
 */
export const MATCH_ARENA_ROWS: readonly string[] = [
  "####################",
  "#..................#",
  "#..................#",
  "#...##........##...#",
  "#...##........##...#",
  "#..................#",
  "#..................#",
  "#...##........##...#",
  "#...##........##...#",
  "#..................#",
  "#..................#",
  "####################",
];
