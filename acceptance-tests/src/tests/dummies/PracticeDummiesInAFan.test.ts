import type {DummySnapshot} from "@gunsmith/shared/state-hook/types/DummySnapshot";
import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The distances the workshop's trial range puts its dummies at, from the player's start, in tiles: near enough to feel a weapon's spread, and
// far enough to feel its range. The last is as far as the rifle sees (12) and the practice range's pillars let a clear line run.
const DISTANCES = [3, 6, 9, 11];

given("the practice range", () => {
  let player = {x: 0, y: 0};
  let dummies: DummySnapshot[] = [];

  beforeEach(async ({gunsmith}) => {
    player = await gunsmith.player.getPosition();
    dummies = await gunsmith.dummies.getAll();
  });

  when("the player looks at the dummies", () => {
    then("four stand, about 3, 6, 9 and 11 tiles away", () => {
      expect(dummies.map(dummy => Math.round(distanceBetween(player, dummy))).sort(byValue)).toEqual(DISTANCES);
    });

    then("none stands on the row or the column the player starts on, where a shot along it would meet it", () => {
      for (const dummy of dummies) {
        expect(dummy.x).not.toBe(player.x);
        expect(dummy.y).not.toBe(player.y);
      }
    });
  });

  for (const distance of DISTANCES) {
    when(`the player aims at the dummy about ${distance} tiles away and fires`, () => {
      let target: DummySnapshot = {x: 0, y: 0, health: 0, visible: false};
      let seenAtTheAim = false;

      beforeEach(async ({gunsmith}) => {
        target = dummyAbout(dummies, player, distance);

        await gunsmith.player.aimAtTile(target);
        await expect.poll(() => gunsmith.dummies.isSeenAt(target)).toBe(true);
        seenAtTheAim = true;

        await gunsmith.player.startFiring();
        await gunsmith.dummies.waitForGone(target);
        await gunsmith.player.stopFiring();
      });

      then("the player sees it and it falls", async ({gunsmith}) => {
        expect(seenAtTheAim).toBe(true);
        expect(await gunsmith.dummies.getHealthAt(target)).toBeUndefined();
      });

      then("every other dummy still stands, untouched, because none stood in the way", async ({gunsmith}) => {
        const others = dummies.filter(dummy => dummy !== target);

        expect((await gunsmith.dummies.getAll()).map(restOf)).toEqual(others.map(restOf));
      });
    });
  }
});

function dummyAbout(dummies: readonly DummySnapshot[], player: Place, distance: number): DummySnapshot {
  const found = dummies.find(dummy => Math.round(distanceBetween(player, dummy)) === distance);
  if (!found) {
    throw new Error(`The practice range has no dummy about ${distance} tiles away.`);
  }

  return found;
}

function distanceBetween(from: Place, to: Place): number {
  return Math.hypot(to.x - from.x, to.y - from.y);
}

function byValue(first: number, second: number): number {
  return first - second;
}

function restOf({x, y, health}: DummySnapshot): DummyAtRest {
  return {x, y, health};
}

interface Place {
  x: number;
  y: number;
}

interface DummyAtRest extends Place {
  health: number;
}
