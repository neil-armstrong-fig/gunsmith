import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import type {WorkshopArena} from "@src/store/workshop/arena/types/WorkshopArena";

const PILLAR_ROWS = [
  "################",
  "#..............#",
  "#..............#",
  "#...#..........#",
  "#..............#",
  "#..............#",
  "#..............#",
  "################",
];

const RAISED_ROWS = [
  "##############",
  "#............#",
  "#............#",
  "#.....111....#",
  "#....>111....#",
  "#.....111....#",
  "#............#",
  "#............#",
  "##############",
];

const PILLAR_YARD = {name: "Stand-in Pillar Yard", rows: PILLAR_ROWS, arena: arenaFrom(PILLAR_ROWS)};
const RAISED_YARD = {name: "Stand-in Raised Yard", rows: RAISED_ROWS, arena: arenaFrom(RAISED_ROWS)};

const HEIGHT_WORDS = /\b(?:high|platforms?|raised|stairs?|terraces?)\b/i;

/** Selects a local sample from the prompt and gives each Make a new result, even when the layout repeats. */
export function standInArenaFor(prompt: string): WorkshopArena {
  if (HEIGHT_WORDS.test(prompt)) {
    return {...RAISED_YARD};
  }

  return {...PILLAR_YARD};
}
