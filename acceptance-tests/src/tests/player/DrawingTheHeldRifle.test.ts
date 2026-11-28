import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const EAST = {x: 16.5, y: 6.5};
const WEST = {x: 2.5, y: 6.5};
const NORTH = {x: 10.5, y: 11.5};
const SOUTH = {x: 10.5, y: 1.5};

given.each(
  [64, 32],
  scale => `sparring at ${scale} pixels per tile`,
  scale => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.browser.resizeWindowTo({width: 20 * scale, height: 12 * scale});
      await gunsmith.scenario.startSparring();
    });

    when.each(
      [
        {direction: "east", tile: EAST},
        {direction: "north", tile: NORTH},
        {direction: "west", tile: WEST},
        {direction: "south", tile: SOUTH},
      ],
      ({direction}) => `the player aims ${direction}`,
      ({tile}) => {
        beforeEach(async ({gunsmith}) => {
          await gunsmith.player.aimAtTile(tile);
        });

        then("the rifle barrel is drawn ahead of their hand", async ({gunsmith}) => {
          await expect.poll(() => gunsmith.player.hasRifleOnScreen()).toBe(true);
        });
      },
    );

    when("the player crouches and aims north", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.aimAtTile(NORTH);

        const {range} = await gunsmith.vision.getView();
        await gunsmith.player.crouch();
        await expect.poll(async () => (await gunsmith.vision.getView()).range).toBeGreaterThan(range);
      });

      then("the crouched player still holds the rifle along their aim", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.player.hasRifleOnScreen()).toBe(true);
      });
    });

    when("the player equips the marksman rifle", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.aimAtTile(NORTH);
        await gunsmith.player.switchTo(2);
        await gunsmith.weapon.waitForSlot(2);
      });

      then("the marksman rifle's violet optic is visible in hand", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.player.hasHeldWeaponAccent("violet")).toBe(true);
      });

      when("the player switches back", () => {
        beforeEach(async ({gunsmith}) => {
          await gunsmith.player.switchTo(1);
          await gunsmith.weapon.waitForSlot(1);
        });

        then("the default rifle drawing returns", async ({gunsmith}) => {
          await expect.poll(() => gunsmith.player.hasRifleOnScreen()).toBe(true);
        });
      });
    });

    when("the player looks at the opponent", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.aimAtTile(EAST);
        await expect.poll(() => gunsmith.vision.isOpponentSeen()).toBe(true);
      });

      then("the opponent holds the rifle", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.opponent.hasRifleOnScreen()).toBe(true);
      });

      when("the player turns away", () => {
        beforeEach(async ({gunsmith}) => {
          await gunsmith.player.aimAtTile(WEST);
          await expect.poll(() => gunsmith.vision.isOpponentSeen()).toBe(false);
        });

        then("the opponent's rifle is hidden as well", async ({gunsmith}) => {
          await expect.poll(() => gunsmith.opponent.hasRifleOnScreen()).toBe(false);
        });

        when("the player turns back", () => {
          beforeEach(async ({gunsmith}) => {
            await gunsmith.player.aimAtTile(EAST);
            await expect.poll(() => gunsmith.vision.isOpponentSeen()).toBe(true);
          });

          then("the opponent's rifle is visible again", async ({gunsmith}) => {
            await expect.poll(() => gunsmith.opponent.hasRifleOnScreen()).toBe(true);
          });
        });
      });
    });
  },
);

given("sparring with the rifle picture missing", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startSparringWithMissingRifle();
    await gunsmith.player.aimAtTile(NORTH);
  });

  then("the player's hand still follows their aim", async ({gunsmith}) => {
    await expect.poll(() => gunsmith.player.isHandOnTheFacingSide()).toBe(true);
    expect(await gunsmith.player.hasRifleOnScreen()).toBe(false);
  });
});
