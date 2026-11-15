import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The same arrangement as `SeeingAcrossLevels`: the player starts at (8.5, 3.5) on the low ground, facing east. A platform one
// level up fills the east end from x = 10, and one stair, on the player's row at x = 9, climbs onto it. A dummy stands on the
// platform four tiles east of the player and another on the low ground four tiles west, both on the player's row. A shot goes
// where the player can see: what the platform's face hides from the low ground it also stops, and from the platform a shot
// flies out over the low ground.
const PLATFORM_DUMMY = {x: 12.5, y: 3.5};
const LOW_GROUND_DUMMY = {x: 4.5, y: 3.5};
const PLATFORM_EDGE = 10;
const PLATFORM = 1;
// Far enough onto the platform to stand on it, and still well short of the dummy there, so nothing stands between the player
// and the dummy behind them.
const JUST_ONTO_THE_PLATFORM = PLATFORM_EDGE + 0.6;

given("a player on the low ground, a dummy on the platform ahead and another on the low ground behind them", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startHeights();
  });

  when("the player shoots at the dummy on the platform", () => {
    let health: number | undefined;

    beforeEach(async ({gunsmith}) => {
      health = await gunsmith.dummies.getHealthAt(PLATFORM_DUMMY);

      await gunsmith.player.aimAtTile(PLATFORM_DUMMY);
      await gunsmith.player.fire();
    });

    then("the shot is stopped by the platform's face and the dummy is not hurt", async ({gunsmith}) => {
      await gunsmith.bullets.waitForABullet();
      await gunsmith.bullets.waitForNoBullets();

      expect(await gunsmith.dummies.getHealthAt(PLATFORM_DUMMY)).toBe(health);
    });
  });

  when("the player shoots at the dummy on the low ground", () => {
    let health: number | undefined;

    beforeEach(async ({gunsmith}) => {
      health = await gunsmith.dummies.getHealthAt(LOW_GROUND_DUMMY);

      await gunsmith.player.aimAtTile(LOW_GROUND_DUMMY);
      await gunsmith.player.fire();
    });

    then("the dummy is hurt, as on any flat ground", async ({gunsmith}) => {
      expect(health).toBeDefined();

      await gunsmith.dummies.waitForHealthBelow(LOW_GROUND_DUMMY, health ?? 0);

      expect(await gunsmith.dummies.getHealthAt(LOW_GROUND_DUMMY)).toBeLessThan(health ?? 0);
    });
  });

  when("the player climbs the stair onto the platform", () => {
    beforeEach(async ({gunsmith}) => {
      // Crouched, so a slow browser that stops the walk late still leaves the player short of the dummy on the platform.
      await gunsmith.player.crouch();
      await gunsmith.player.startWalking("east");
      await expect.poll(async () => (await gunsmith.player.getPosition()).x).toBeGreaterThan(JUST_ONTO_THE_PLATFORM);
      await gunsmith.player.stopWalking("east");

      expect(await gunsmith.player.getLevel()).toBe(PLATFORM);
    });

    when("the player shoots at the dummy on the platform", () => {
      let health: number | undefined;

      beforeEach(async ({gunsmith}) => {
        health = await gunsmith.dummies.getHealthAt(PLATFORM_DUMMY);

        await gunsmith.player.aimAtTile(PLATFORM_DUMMY);
        await gunsmith.player.fire();
      });

      then("the dummy is hurt, now that they stand on the same level", async ({gunsmith}) => {
        expect(health).toBeDefined();

        await gunsmith.dummies.waitForHealthBelow(PLATFORM_DUMMY, health ?? 0);

        expect(await gunsmith.dummies.getHealthAt(PLATFORM_DUMMY)).toBeLessThan(health ?? 0);
      });
    });

    when("the player shoots back down at the dummy on the low ground", () => {
      let health: number | undefined;

      beforeEach(async ({gunsmith}) => {
        health = await gunsmith.dummies.getHealthAt(LOW_GROUND_DUMMY);

        await gunsmith.player.aimAtTile(LOW_GROUND_DUMMY);
        await gunsmith.player.fire();
      });

      then("the dummy is hurt, because a shot from higher ground flies out over the low ground", async ({gunsmith}) => {
        expect(health).toBeDefined();

        await gunsmith.dummies.waitForHealthBelow(LOW_GROUND_DUMMY, health ?? 0);

        expect(await gunsmith.dummies.getHealthAt(LOW_GROUND_DUMMY)).toBeLessThan(health ?? 0);
      });
    });
  });
});
