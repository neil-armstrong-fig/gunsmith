import type {DummySnapshot} from "@gunsmith/shared/state-hook/types/DummySnapshot";
import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

given("a match has just begun", () => {
  when("the player shoots at a dummy once", () => {
    let before: DummySnapshot[] = [];

    beforeEach(async ({gunsmith}) => {
      before = await gunsmith.dummies.getAll();

      await gunsmith.player.aimAtTile(firstOf(before));
      await gunsmith.player.fire();
    });

    then("that dummy has less health but is still standing", async ({gunsmith}) => {
      const target = firstOf(before);

      await gunsmith.dummies.waitForHealthBelow(target, target.health);

      expect(await gunsmith.dummies.getHealthAt(target)).toBeLessThan(target.health);
    });

    then("the other dummies are untouched", async ({gunsmith}) => {
      await gunsmith.dummies.waitForHealthBelow(firstOf(before), firstOf(before).health);

      expect(await gunsmith.dummies.getAll()).toEqual(expect.arrayContaining(before.slice(1)));
    });
  });

  when("the player keeps firing at a dummy", () => {
    let before: DummySnapshot[] = [];

    beforeEach(async ({gunsmith}) => {
      before = await gunsmith.dummies.getAll();

      await gunsmith.player.aimAtTile(firstOf(before));
      await gunsmith.player.startFiring();
    });

    then("that dummy falls", async ({gunsmith}) => {
      await gunsmith.dummies.waitForGone(firstOf(before));

      expect(await gunsmith.dummies.getHealthAt(firstOf(before))).toBeUndefined();
    });

    then("the other dummies are untouched", async ({gunsmith}) => {
      await gunsmith.dummies.waitForGone(firstOf(before));

      expect(await gunsmith.dummies.getAll()).toEqual(before.slice(1));
    });
  });

  when("the player fires where there is no dummy", () => {
    let before: DummySnapshot[] = [];

    beforeEach(async ({gunsmith}) => {
      before = await gunsmith.dummies.getAll();
      const player = await gunsmith.player.getPosition();

      await gunsmith.player.aimAtTile({x: player.x - 3, y: player.y});
      await gunsmith.player.fire();
    });

    then("no dummy is hurt", async ({gunsmith}) => {
      await gunsmith.bullets.waitForABullet();
      await gunsmith.bullets.waitForNoBullets();

      expect(before.length).toBeGreaterThan(0);
      expect(await gunsmith.dummies.getAll()).toEqual(before);
    });
  });
});

/** The dummy these specs shoot at: the first one the game lists. They never move, so it is the same one every time. */
function firstOf(dummies: readonly DummySnapshot[]): DummySnapshot {
  const first = dummies[0];
  if (!first) {
    throw new Error("The practice arena has no dummy to shoot at.");
  }

  return first;
}
