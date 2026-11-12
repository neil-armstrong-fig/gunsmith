import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

given("a match has just begun", () => {
  when("the player holds the trigger at a wall until the magazine is empty", () => {
    beforeEach(async ({gunsmith}) => {
      const player = await gunsmith.player.getPosition();

      await gunsmith.player.aimAtTile({x: player.x, y: player.y + 3});
      await gunsmith.player.startFiring();
      await gunsmith.weapon.waitForRounds(0);
    });

    then("no more bullets leave, however long the trigger stays held", async ({gunsmith}) => {
      await gunsmith.bullets.waitForNoBullets();
      await gunsmith.waitForGameSeconds(0.5);

      expect(await gunsmith.bullets.count()).toBe(0);
      expect((await gunsmith.weapon.get()).rounds).toBe(0);
    });
  });

  when("the player fires one shot and reloads", () => {
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

    then("the magazine is not refilled while the reload runs", async ({gunsmith}) => {
      expect(await gunsmith.weapon.get()).toMatchObject({
        reloading: true,
        rounds: magazineSize - 1,
        reserve: reserveBefore,
      });
    });

    then(
      "the magazine is full again once the reload ends, with the round taken from the reserve",
      async ({gunsmith}) => {
        await gunsmith.weapon.waitForReloadToEnd();

        expect(await gunsmith.weapon.get()).toMatchObject({
          reloading: false,
          rounds: magazineSize,
          reserve: reserveBefore - 1,
        });
      },
    );
  });

  when("the player empties the magazine, reloads and fires again", () => {
    let magazineSize = 0;

    beforeEach(async ({gunsmith}) => {
      magazineSize = (await gunsmith.weapon.get()).rounds;

      const player = await gunsmith.player.getPosition();
      await gunsmith.player.aimAtTile({x: player.x, y: player.y + 3});
      await gunsmith.player.startFiring();
      await gunsmith.weapon.waitForRounds(0);
      await gunsmith.player.stopFiring();

      await gunsmith.player.reload();
      await gunsmith.weapon.waitForReloadToStart();
      await gunsmith.weapon.waitForReloadToEnd();
      await gunsmith.player.fire();
    });

    then("the weapon fires: a round is spent from the refilled magazine", async ({gunsmith}) => {
      await gunsmith.weapon.waitForRounds(magazineSize - 1);

      expect((await gunsmith.weapon.get()).rounds).toBe(magazineSize - 1);
    });
  });

  when("the player reloads a full magazine", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.reload();
    });

    then("nothing is reloaded", async ({gunsmith}) => {
      await gunsmith.waitForGameSeconds(0.5);

      expect((await gunsmith.weapon.get()).reloading).toBe(false);
    });
  });
});
