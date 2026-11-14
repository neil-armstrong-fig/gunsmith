import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

given("a sparring match has just begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startSparring();
  });

  when("the player crouches", () => {
    let standingView = {degrees: 0, range: 0};

    beforeEach(async ({gunsmith}) => {
      standingView = await gunsmith.vision.getView();
      await gunsmith.player.crouch();
    });

    then("the player sees farther than standing", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.vision.getView()).range).toBeGreaterThan(standingView.range);
    });

    then("the cone is no wider than standing", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.vision.getView()).range).toBeGreaterThan(standingView.range);

      expect((await gunsmith.vision.getView()).degrees).toBe(standingView.degrees);
    });

    when("the window loses focus while the player is still holding the crouch key", () => {
      beforeEach(async ({gunsmith}) => {
        await expect.poll(async () => (await gunsmith.vision.getView()).range).toBeGreaterThan(standingView.range);
        await gunsmith.player.loseFocus();
      });

      then("the player sees as far as before, since the release was never sent", async ({gunsmith}) => {
        await expect.poll(async () => (await gunsmith.vision.getView()).range).toBe(standingView.range);
      });
    });

    when("the player stands up again", () => {
      beforeEach(async ({gunsmith}) => {
        await expect.poll(async () => (await gunsmith.vision.getView()).range).toBeGreaterThan(standingView.range);
        await gunsmith.player.standUp();
      });

      then("the player sees as far as before", async ({gunsmith}) => {
        await expect.poll(async () => (await gunsmith.vision.getView()).range).toBe(standingView.range);
      });
    });
  });

  when("the player walks away until the opponent is farther than a standing view reaches, facing it", () => {
    beforeEach(async ({gunsmith}) => {
      const opponent = await gunsmith.opponent.get();
      const {range} = await gunsmith.vision.getView();

      await gunsmith.player.startWalking("west");
      await expect.poll(async () => opponent.x - (await gunsmith.player.getPosition()).x).toBeGreaterThan(range + 0.5);
      await gunsmith.player.stopWalking("west");
      await gunsmith.player.aimAtTile(opponent);
    });

    then("the player does not see the opponent", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.vision.isOpponentSeen()).toBe(false);
    });

    when("the player crouches", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.crouch();
      });

      then("the player sees the opponent", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.vision.isOpponentSeen()).toBe(true);
      });
    });
  });
});
