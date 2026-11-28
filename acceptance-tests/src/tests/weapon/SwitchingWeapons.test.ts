import type {DummySnapshot} from "@gunsmith/shared/state-hook/types/DummySnapshot";
import type {WeaponSnapshot} from "@gunsmith/shared/state-hook/types/WeaponSnapshot";
import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

given("a match has just begun", () => {
  when("the player presses 2", () => {
    let before: WeaponSnapshot | undefined;

    beforeEach(async ({gunsmith}) => {
      before = await gunsmith.weapon.get();

      await gunsmith.player.switchTo(2);
    });

    then("the weapon in slot 2 is in hand, with ammunition of its own", async ({gunsmith}) => {
      await gunsmith.weapon.waitForSlot(2);

      const after = await gunsmith.weapon.get();
      expect(after.slot).toBe(2);
      expect(after.rounds).not.toBe(before?.rounds);
    });
  });

  when("the player fires a shot, switches to the other weapon and back", () => {
    let magazineSize = 0;

    beforeEach(async ({gunsmith}) => {
      magazineSize = (await gunsmith.weapon.get()).rounds;

      const player = await gunsmith.player.getPosition();
      await gunsmith.player.aimAtTile({x: player.x, y: player.y + 3});
      await gunsmith.player.fire();
      await gunsmith.weapon.waitForRounds(magazineSize - 1);

      await gunsmith.player.switchTo(2);
      await gunsmith.weapon.waitForSlot(2);
      await gunsmith.player.switchTo(1);
      await gunsmith.weapon.waitForSlot(1);
    });

    then("the first weapon still has the rounds it had", async ({gunsmith}) => {
      expect(await gunsmith.weapon.get()).toMatchObject({slot: 1, rounds: magazineSize - 1});
    });
  });

  when("the player shoots one dummy with each weapon in turn", () => {
    let firstDummy: DummySnapshot = {x: 0, y: 0, health: 0, visible: false};
    let secondDummy: DummySnapshot = {x: 0, y: 0, health: 0, visible: false};

    beforeEach(async ({gunsmith}) => {
      const dummies = await gunsmith.dummies.getAll();
      firstDummy = dummyNumber(dummies, 0);
      secondDummy = dummyNumber(dummies, 1);

      await gunsmith.player.aimAtTile(firstDummy);
      await gunsmith.player.fire();
      await gunsmith.dummies.waitForHealthBelow(firstDummy, firstDummy.health);
      // The shot's cool-down is shorter than its flight to the dummy, but not by much: let it run out, or the next
      // click lands inside it and is swallowed.
      await gunsmith.clock.waitForGameSeconds(0.3);

      await gunsmith.player.switchTo(2);
      await gunsmith.weapon.waitForSlot(2);
      await gunsmith.player.aimAtTile(secondDummy);
      await gunsmith.player.fire();
      await gunsmith.dummies.waitForHealthBelow(secondDummy, secondDummy.health);
    });

    then("the second weapon takes more health off its dummy than the first took off its own", async ({gunsmith}) => {
      const lostByFirst = firstDummy.health - ((await gunsmith.dummies.getHealthAt(firstDummy)) ?? 0);
      const lostBySecond = secondDummy.health - ((await gunsmith.dummies.getHealthAt(secondDummy)) ?? 0);

      expect(lostByFirst).toBeGreaterThan(0);
      expect(lostBySecond).toBeGreaterThan(lostByFirst);
    });
  });

  when("the player switches weapon in the middle of a reload", () => {
    let magazineSize = 0;

    beforeEach(async ({gunsmith}) => {
      magazineSize = (await gunsmith.weapon.get()).rounds;

      const player = await gunsmith.player.getPosition();
      await gunsmith.player.aimAtTile({x: player.x, y: player.y + 3});
      await gunsmith.player.fire();
      await gunsmith.weapon.waitForRounds(magazineSize - 1);

      await gunsmith.player.reload();
      await gunsmith.weapon.waitForReloadToStart();
      await gunsmith.player.switchTo(2);
      await gunsmith.weapon.waitForSlot(2);
    });

    then("the weapon now in hand is not being reloaded", async ({gunsmith}) => {
      expect((await gunsmith.weapon.get()).reloading).toBe(false);
    });

    when("the player then switches back after the reload time has passed", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.clock.waitForGameSeconds(3);
        await gunsmith.player.switchTo(1);
        await gunsmith.weapon.waitForSlot(1);
      });

      then("the first weapon was never refilled", async ({gunsmith}) => {
        expect(await gunsmith.weapon.get()).toMatchObject({slot: 1, rounds: magazineSize - 1, reloading: false});
      });
    });
  });
});

/** The dummy at `index` in the game's list. They never move, so it is the same one every time. */
function dummyNumber(dummies: readonly DummySnapshot[], index: number): DummySnapshot {
  const dummy = dummies[index];
  if (!dummy) {
    throw new Error(`The practice arena has no dummy number ${index + 1} to shoot at.`);
  }

  return dummy;
}
