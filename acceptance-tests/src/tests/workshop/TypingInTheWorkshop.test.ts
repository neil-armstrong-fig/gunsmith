import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

given("a player who has fired one shot on the practice range", () => {
  let roundsAfterTheShot = 0;

  beforeEach(async ({gunsmith}) => {
    const start = await gunsmith.weapon.get();
    const player = await gunsmith.player.getPosition();

    await gunsmith.player.aimAtTile({x: player.x, y: player.y + 3});
    await gunsmith.player.fire();
    roundsAfterTheShot = start.rounds - 1;
    await gunsmith.weapon.waitForRounds(roundsAfterTheShot);
  });

  when("the player types the game's own keys into the workshop's prompt, then shuts it", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.open();
      await gunsmith.workshop.typeThePrompt("wasd reload 12 mute crouch");
      await gunsmith.workshop.close();
      await gunsmith.waitForGameSeconds(0.5);
    });

    then("the weapon is as it was: the same slot, no reload begun, the same rounds", async ({gunsmith}) => {
      expect(await gunsmith.weapon.get()).toMatchObject({slot: 1, reloading: false, rounds: roundsAfterTheShot});
    });
  });

  when("the player presses the mouse on the panel, shuts the workshop and lets the mouse go", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.open();
      await gunsmith.workshop.holdTheMouseOnThePanel();
      await gunsmith.workshop.close();
      await gunsmith.waitForGameSeconds(0.5);
    });

    then("no shot was fired by it: the magazine is as it was", async ({gunsmith}) => {
      expect((await gunsmith.weapon.get()).rounds).toBe(roundsAfterTheShot);
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
