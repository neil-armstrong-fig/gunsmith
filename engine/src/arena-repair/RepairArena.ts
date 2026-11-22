import {FLOOR} from "@gunsmith/engine/arena/drawing/level/Floor";
import {RAISED_LEVELS} from "@gunsmith/engine/arena/drawing/level/RaisedLevels";
import {WALL} from "@gunsmith/engine/arena/drawing/Wall";
import {openDoor} from "@gunsmith/engine/arena-repair/doors/OpenDoor";
import {characterAt} from "@gunsmith/engine/arena-repair/drawing/CharacterAt";
import {isReadable} from "@gunsmith/engine/arena-repair/drawing/IsReadable";
import {regionsOfDrawing} from "@gunsmith/engine/arena-repair/drawing/RegionsOfDrawing";
import {withCharacter} from "@gunsmith/engine/arena-repair/drawing/WithCharacter";
import {addStair} from "@gunsmith/engine/arena-repair/stairs/AddStair";
import {dropIllegalStairs} from "@gunsmith/engine/arena-repair/stairs/DropIllegalStairs";
import type {ArenaEdit} from "@gunsmith/engine/arena-repair/types/ArenaEdit";
import type {ArenaRepair} from "@gunsmith/engine/arena-repair/types/ArenaRepair";
import type {DrawingRegions} from "@gunsmith/engine/arena-repair/types/DrawingRegions";
import type {DrawnTile} from "@gunsmith/engine/arena-repair/types/DrawnTile";

/**
 * A cut-off piece of low floor is walled in, not joined, only when it is a sliver: no more tiles than this and no larger a share of all the
 * floor than this (tunables for play). A bigger piece is a room the model drew, and gets a door; walling in half an arena would leave
 * it too walled to play.
 */
const POCKET_MOST_TILES = 12;
const POCKET_MOST_SHARE_OF_FLOOR = 0.1;

/** The most pieces of floor one repair mends, which is far more than a model's drawing needs (a real one has a few faults, and one such repair took 2 to 4 ms in Node) and bounds the work for any drawing at all (a 40 by 30 drawing of nothing but faults took about a second at a cap of 200). */
const MOST_MENDS = 100;

/**
 * Mends the faults a model most often draws into an arena, with plain rules and no model call, so that it is code that makes an
 * arena playable and not the model's luck. The drawing keeps what it drew: a legal stair, a platform that can be reached and a
 * wall that closes nothing are left exactly as they are. Otherwise, in this order: a stair the engine refuses is drawn as
 * floor; a platform cut off from the rest gets a stair beside it, or is lowered a level when no stair fits; a sliver of low
 * floor is walled in, and a bigger piece gets a door cut through the thinnest wall to the arena. The border is never
 * touched. Every change is checked by the engine's own reading of the drawing (`arenaFrom`), and a drawing it cannot read, or that
 * has no floor, is returned as it came: the validator, which stays the judge, says what is wrong with it. Playability is not decided
 * here, only repaired toward: the result still goes through `validateArena`.
 */
export function repairArena(rows: readonly string[]): ArenaRepair {
  const stairs = dropIllegalStairs(rows);
  if (!isReadable(stairs.rows)) {
    return {rows: [...rows], edits: []};
  }

  let repair: ArenaRepair = {rows: stairs.rows, edits: stairEdits(stairs.dropped)};

  for (let mend = 0; mend < MOST_MENDS; mend += 1) {
    const regions = regionsOfDrawing(repair.rows);
    const pocket = regions.cutOff[0];
    if (pocket === undefined) {
      break;
    }

    const mended = mendPocket(repair.rows, pocket, regions);
    const checked = dropIllegalStairs(mended.rows);
    if (!isReadable(checked.rows)) {
      break;
    }

    repair = {
      rows: checked.rows,
      edits: [...repair.edits, ...mended.edits, ...stairEdits(checked.dropped)],
    };
  }

  return repair;
}

function stairEdits(dropped: number): ArenaEdit[] {
  if (dropped === 0) {
    return [];
  }

  return [{kind: "stairDropped", tiles: dropped}];
}

/** One mend of one cut-off piece of floor, as the order in `repairArena` says. */
function mendPocket(rows: readonly string[], pocket: readonly DrawnTile[], regions: DrawingRegions): ArenaRepair {
  const raised = pocket.filter(tile => isRaised(characterAt(rows, tile)));
  if (raised.length > 0) {
    return mendPlatform(rows, raised, regions.main);
  }

  if (isSliver(pocket, regions)) {
    return wallIn(rows, pocket);
  }

  const door = openDoor(rows, pocket, regions.main);
  if (door === undefined) {
    return wallIn(rows, pocket);
  }

  return {rows: door.rows, edits: [{kind: "doorOpened", tiles: door.tiles}]};
}

function mendPlatform(rows: readonly string[], raised: readonly DrawnTile[], main: readonly DrawnTile[]): ArenaRepair {
  const withStair = addStair(rows, raised, main);
  if (withStair !== undefined) {
    return {rows: withStair, edits: [{kind: "stairAdded", tiles: 1}]};
  }

  let lowered = [...rows];
  for (const tile of raised) {
    const level = RAISED_LEVELS[characterAt(rows, tile) ?? ""] ?? 1;
    lowered = withCharacter(lowered, tile, characterOfLevel(level - 1));
  }

  return {rows: lowered, edits: [{kind: "platformLowered", tiles: raised.length}]};
}

function wallIn(rows: readonly string[], pocket: readonly DrawnTile[]): ArenaRepair {
  let walled = [...rows];
  for (const tile of pocket) {
    walled = withCharacter(walled, tile, WALL);
  }

  return {rows: walled, edits: [{kind: "pocketWalled", tiles: pocket.length}]};
}

/** Whether a cut-off piece of low floor is small enough, in tiles and against all the floor, to be walled in rather than joined. */
function isSliver(pocket: readonly DrawnTile[], regions: DrawingRegions): boolean {
  const floor = regions.cutOff.reduce((total, region) => total + region.length, regions.main.length);

  return pocket.length <= POCKET_MOST_TILES && pocket.length <= floor * POCKET_MOST_SHARE_OF_FLOOR;
}

function isRaised(character: string | undefined): boolean {
  return character !== undefined && Object.hasOwn(RAISED_LEVELS, character);
}

/** The character floor of a level is drawn with: floor on the low ground, `1` one level up. */
function characterOfLevel(level: number): string {
  if (level <= 0) {
    return FLOOR;
  }

  return String(level);
}
