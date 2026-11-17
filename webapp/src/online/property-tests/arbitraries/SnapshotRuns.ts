import fc from "fast-check";
import {arenaFrom} from "@gunsmith/engine/arena/ArenaFrom";
import {startingWorld} from "@gunsmith/engine/game-loop/StartingWorld";
import type {Player} from "@gunsmith/engine/player/types/Player";
import type {SnapshotOfOpponent} from "@src/online/interpolation/types/SnapshotOfOpponent";
import {points} from "@src/online/property-tests/arbitraries/Points";

const FIGHTER: Player = startingWorld(arenaFrom(["#####", "#...#", "#####"]), [], {x: 2.5, y: 1.5}).player;

/** What a run of snapshots said of the other fighter: up to ten, later and later, the fighter in some and not in others, anywhere in a ten-tile room, facing any way. */
export function snapshotRuns(): fc.Arbitrary<SnapshotOfOpponent[]> {
  return fc
    .array(fc.tuple(fc.double({min: 0.001, max: 2, noNaN: true}), fighters()), {minLength: 1, maxLength: 10})
    .map(told => {
      let elapsedSeconds = 0;

      return told.map(([gap, opponent]) => {
        elapsedSeconds += gap;

        return {elapsedSeconds, opponent};
      });
    });
}

function fighters(): fc.Arbitrary<Player | undefined> {
  return fc.option(
    fc.tuple(points(0, 10), fc.double({min: -3, max: 3, noNaN: true})).map(([position, heading]): Player => ({
      ...FIGHTER,
      position,
      aim: {x: Math.cos(heading), y: Math.sin(heading)},
    })),
    {nil: undefined},
  );
}
