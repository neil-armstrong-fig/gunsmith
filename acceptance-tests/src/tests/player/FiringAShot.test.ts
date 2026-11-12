import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The way to aim, as an offset from the player, and which axis a shot that way travels along.
const SHOTS = [
  {heading: "east", offset: {x: 3, y: 0}, along: "x", across: "y", sign: 1},
  {heading: "west", offset: {x: -3, y: 0}, along: "x", across: "y", sign: -1},
  {heading: "north", offset: {x: 0, y: 3}, along: "y", across: "x", sign: 1},
  {heading: "south", offset: {x: 0, y: -3}, along: "y", across: "x", sign: -1},
] as const;

given("a match has just begun", () => {
  when.each(
    SHOTS,
    shot => `the player aims ${shot.heading} and clicks`,
    ({heading, offset, along, across, sign}) => {
      beforeEach(async ({gunsmith}) => {
        const player = await gunsmith.player.getPosition();

        await gunsmith.player.aimAtTile({x: player.x + offset.x, y: player.y + offset.y});
        await gunsmith.player.fire();
      });

      then(`a bullet leaves the player heading ${heading}`, async ({gunsmith}) => {
        const player = await gunsmith.player.getPosition();
        const bullet = await gunsmith.bullets.waitForABullet();

        expect((bullet[along] - player[along]) * sign).toBeGreaterThan(0.4);
        expect(Math.abs(bullet[across] - player[across])).toBeLessThan(0.1);
      });
    },
  );

  when("the player fires at the nearest wall", () => {
    beforeEach(async ({gunsmith}) => {
      const player = await gunsmith.player.getPosition();

      await gunsmith.player.aimAtTile({x: player.x, y: player.y + 3});
      await gunsmith.player.fire();
    });

    then("the bullet is gone once it reaches the wall", async ({gunsmith}) => {
      await gunsmith.bullets.waitForABullet();
      await gunsmith.bullets.waitForNoBullets();
    });
  });

  when("the player has not clicked", () => {
    then("no bullet is in the air", async ({gunsmith}) => {
      await gunsmith.waitForGameSeconds(0.5);

      expect(await gunsmith.bullets.count()).toBe(0);
    });
  });
});
