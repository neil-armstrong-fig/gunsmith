import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// How far past the middle of the arena, along an axis, counts as having walked that way.
const WALKS = [
  {heading: "east", axis: "x", sign: 1},
  {heading: "west", axis: "x", sign: -1},
  {heading: "north", axis: "y", sign: 1},
  {heading: "south", axis: "y", sign: -1},
] as const;

const FAR_ENOUGH = 2;

given("a match has just begun", () => {
  when.each(
    WALKS,
    walk => `the player holds the key for ${walk.heading}`,
    ({heading, axis, sign}) => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.startWalking(heading);
      });

      then(`the player walks ${heading}`, async ({gunsmith}) => {
        const size = await gunsmith.arena.getSizeInTiles();
        const middle = {x: size.width / 2, y: size.height / 2};

        await expect
          .poll(async () => ((await gunsmith.player.getPosition())[axis] - middle[axis]) * sign)
          .toBeGreaterThan(FAR_ENOUGH);
      });
    },
  );

  when("the player holds the key for east until they reach the wall", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.startWalking("east");
    });

    then("the player stays inside the arena, stopped by the wall", async ({gunsmith}) => {
      const size = await gunsmith.arena.getSizeInTiles();

      await expect.poll(async () => (await gunsmith.player.getPosition()).x).toBeGreaterThan(size.width - 2);
      await gunsmith.clock.waitForGameSeconds(1);

      const {x} = await gunsmith.player.getPosition();
      expect(x).toBeLessThan(size.width - 1);
      expect(x).toBeGreaterThan(size.width - 2);
    });
  });

  when("the player lets go of every key", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.startWalking("east");
      await gunsmith.clock.waitForGameSeconds(0.2);
      await gunsmith.player.stopWalking("east");
    });

    then("the player stands still", async ({gunsmith}) => {
      const before = await gunsmith.player.getPosition();
      await gunsmith.clock.waitForGameSeconds(0.5);

      expect(await gunsmith.player.getPosition()).toEqual(before);
    });
  });
});
