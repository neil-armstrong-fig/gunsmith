import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

given("a match has just begun", () => {
  when("the player has done nothing yet", () => {
    then("the screen shows the ammunition of the weapon in hand", async ({gunsmith}) => {
      const weapon = await gunsmith.weapon.get();

      await gunsmith.hud.waitForRounds(weapon.rounds);

      expect(await gunsmith.hud.getAmmo()).toEqual({
        slot: weapon.slot,
        rounds: weapon.rounds,
        reserve: weapon.reserve,
        reloading: false,
      });
    });

    then("the magazine bar has a segment for each round the magazine holds, all filled", async ({gunsmith}) => {
      const weapon = await gunsmith.weapon.get();

      await gunsmith.hud.waitForRounds(weapon.rounds);

      expect(await gunsmith.hud.getMagazineBar()).toEqual({segments: weapon.rounds, filled: weapon.rounds});
    });
  });

  when("the player fires one shot", () => {
    let magazineSize = 0;

    beforeEach(async ({gunsmith}) => {
      magazineSize = (await gunsmith.weapon.get()).rounds;

      const player = await gunsmith.player.getPosition();
      await gunsmith.player.aimAtTile({x: player.x, y: player.y + 3});
      await gunsmith.player.fire();
      await gunsmith.weapon.waitForRounds(magazineSize - 1);
    });

    then("the screen shows one round fewer, and one segment empty", async ({gunsmith}) => {
      await gunsmith.hud.waitForRounds(magazineSize - 1);

      expect((await gunsmith.hud.getAmmo()).rounds).toBe(magazineSize - 1);
      expect(await gunsmith.hud.getMagazineBar()).toEqual({segments: magazineSize, filled: magazineSize - 1});
    });
  });

  when("the player reloads after a shot", () => {
    let magazineSize = 0;
    let reserveBefore = 0;

    beforeEach(async ({gunsmith}) => {
      const start = await gunsmith.weapon.get();
      magazineSize = start.rounds;
      reserveBefore = start.reserve;

      const player = await gunsmith.player.getPosition();
      await gunsmith.player.aimAtTile({x: player.x, y: player.y + 3});
      await gunsmith.player.fire();
      await gunsmith.weapon.waitForRounds(magazineSize - 1);

      await gunsmith.player.reload();
      await gunsmith.weapon.waitForReloadToStart();
    });

    then("the screen says the weapon is reloading", async ({gunsmith}) => {
      await gunsmith.hud.waitForReloadToStart();

      expect((await gunsmith.hud.getAmmo()).reloading).toBe(true);
    });

    then("the screen shows the full magazine and the smaller reserve once the reload is over", async ({gunsmith}) => {
      await gunsmith.weapon.waitForReloadToEnd();
      await gunsmith.hud.waitForReloadToEnd();

      expect(await gunsmith.hud.getAmmo()).toMatchObject({
        reloading: false,
        rounds: magazineSize,
        reserve: reserveBefore - 1,
      });
      expect(await gunsmith.hud.getMagazineBar()).toEqual({segments: magazineSize, filled: magazineSize});
    });
  });

  when("the player presses 2", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.switchTo(2);
      await gunsmith.weapon.waitForSlot(2);
    });

    then("the screen shows the second weapon, with its own ammunition and magazine bar", async ({gunsmith}) => {
      const weapon = await gunsmith.weapon.get();

      await gunsmith.hud.waitForSlot(2);

      expect(await gunsmith.hud.getAmmo()).toEqual({
        slot: 2,
        rounds: weapon.rounds,
        reserve: weapon.reserve,
        reloading: false,
      });
      expect(await gunsmith.hud.getMagazineBar()).toEqual({segments: weapon.rounds, filled: weapon.rounds});
    });
  });
});
