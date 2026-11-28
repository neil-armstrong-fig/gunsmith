import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The player starts at (10.5, 6.5) in the sparring arena and the opponent stands six tiles east on the same row, which is
// clear floor all the way. A tile far to the west, on that row, is behind the player.
const BEHIND_THE_PLAYER = {x: 2.5, y: 6.5};

given("a sparring match has just begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startSparring();
  });

  when("the player faces the opponent", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(await gunsmith.opponent.get());
    });

    then("the player sees the opponent", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.vision.isOpponentSeen()).toBe(true);
    });

    then("what the player sees in detail is a cone, not the whole way round", async ({gunsmith}) => {
      const view = await gunsmith.vision.getView();

      expect(view.degrees).toBeGreaterThan(0);
      expect(view.degrees).toBeLessThan(180);
      expect(view.range).toBeGreaterThan(0);
    });
  });

  when("the player turns their back on the opponent", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(BEHIND_THE_PLAYER);
    });

    then("the player no longer sees the opponent, who is still there", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.vision.isOpponentSeen()).toBe(false);

      expect((await gunsmith.opponent.get()).health).toBeGreaterThan(0);
    });
  });

  when("the player faces well off to one side of the opponent, about 70 degrees away", () => {
    beforeEach(async ({gunsmith}) => {
      const player = await gunsmith.player.getPosition();

      await gunsmith.player.aimAtTile({x: player.x + 1, y: player.y + 2.75});
    });

    then("the player does not see the opponent, though it is not behind them", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.vision.isOpponentSeen()).toBe(false);
    });
  });

  when("the player turns away and then back", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(BEHIND_THE_PLAYER);
      await expect.poll(() => gunsmith.vision.isOpponentSeen()).toBe(false);
      await gunsmith.player.aimAtTile(await gunsmith.opponent.get());
    });

    then("the player sees the opponent again", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.vision.isOpponentSeen()).toBe(true);
    });
  });

  when("the player walks away until the opponent is farther than the rifle sees, facing it", () => {
    beforeEach(async ({gunsmith}) => {
      const opponent = await gunsmith.opponent.get();
      const {range} = await gunsmith.vision.getView();

      await gunsmith.player.startWalking("west");
      await expect.poll(async () => opponent.x - (await gunsmith.player.getPosition()).x).toBeGreaterThan(range + 0.5);
      await gunsmith.player.stopWalking("west");
      await gunsmith.player.aimAtTile(opponent);
    });

    then("the player does not see the opponent, though nothing is in the way", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.vision.isOpponentSeen()).toBe(false);
    });

    when("the player takes out the weapon that sees farther", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.switchTo(2);
      });

      then("the player sees the opponent", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.vision.isOpponentSeen()).toBe(true);
      });
    });
  });

  when("the player stands where a pillar is between them and the opponent, facing it", () => {
    beforeEach(async ({gunsmith}) => {
      const opponent = await gunsmith.opponent.get();

      await gunsmith.player.startWalking("north");
      await expect.poll(async () => (await gunsmith.player.getPosition()).y).toBeGreaterThan(8.4);
      await gunsmith.player.stopWalking("north");

      await gunsmith.player.startWalking("east");
      await expect.poll(async () => (await gunsmith.player.getPosition()).x).toBeGreaterThan(12.4);
      await gunsmith.player.stopWalking("east");

      await gunsmith.player.aimAtTile(opponent);
    });

    then("the player does not see the opponent, though it is in front and near", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.vision.isOpponentSeen()).toBe(false);
    });
  });
});
