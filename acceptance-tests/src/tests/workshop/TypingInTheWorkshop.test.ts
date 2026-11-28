import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The workshop fills the magazine when it opens, free, so what these criteria compare with is a full magazine: a click that fired through the
// panel leaves one round fewer, and a typed `1` or `2` that reached the game switches the slot. A typed `r` is not seen here: reloading a
// full magazine does nothing, so a leaked `r` shows nothing after the workshop has refilled.
given("a player who has fired one shot on the practice range", () => {
  let fullMagazine = 0;

  beforeEach(async ({gunsmith}) => {
    const start = await gunsmith.weapon.get();
    const player = await gunsmith.player.getPosition();

    await gunsmith.player.aimAtTile({x: player.x, y: player.y + 3});
    await gunsmith.player.fire();
    fullMagazine = start.rounds;
    await gunsmith.weapon.waitForRounds(fullMagazine - 1);
  });

  when("the player types the game's own keys into the workshop's prompt, then shuts it", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.open();
      await gunsmith.workshop.typeThePrompt("wasd reload 12 mute crouch");
      await gunsmith.workshop.close();

      await gunsmith.clock.waitForGameSeconds(0.5);
    });

    then(
      "the weapon is as the workshop left it: the same slot, no reload begun, a full magazine",
      async ({gunsmith}) => {
        expect(await gunsmith.weapon.get()).toMatchObject({slot: 1, reloading: false, rounds: fullMagazine});
      },
    );
  });

  when("the player presses the mouse on the panel, shuts the workshop and lets the mouse go", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.open();
      await gunsmith.workshop.holdTheMouseOnThePanel();
      await gunsmith.workshop.close();

      await gunsmith.clock.waitForGameSeconds(0.5);
    });

    then("no shot was fired by it: the magazine is as full as the workshop made it", async ({gunsmith}) => {
      expect((await gunsmith.weapon.get()).rounds).toBe(fullMagazine);
    });
  });

  when("the player types into the workshop's prompt, shuts it and opens it again", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.open();
      await gunsmith.workshop.typeThePrompt("wasd reload 12 mute crouch");
      await gunsmith.workshop.close();

      await gunsmith.workshop.open();
    });

    then("what was typed is still there", async ({gunsmith}) => {
      expect(await gunsmith.workshop.getPrompt()).toBe("wasd reload 12 mute crouch");
    });
  });
});
