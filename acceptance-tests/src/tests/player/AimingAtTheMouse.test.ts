import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// Where the mouse is, relative to the player, and the way the player should then face (0 is east, 90 is north).
const AIMS = [
  {where: "east of", offset: {x: 3, y: 0}, degrees: 0},
  {where: "north-east of", offset: {x: 3, y: 3}, degrees: 45},
  {where: "north of", offset: {x: 0, y: 3}, degrees: 90},
  {where: "north-west of", offset: {x: -3, y: 3}, degrees: 135},
  {where: "south-west of", offset: {x: -3, y: -3}, degrees: -135},
  {where: "south of", offset: {x: 0, y: -3}, degrees: -90},
] as const;

given("a match has just begun", () => {
  when.each(
    AIMS,
    aim => `the mouse is ${aim.where} the player`,
    ({offset, degrees}) => {
      beforeEach(async ({gunsmith}) => {
        const player = await gunsmith.player.getPosition();

        await gunsmith.player.aimAtTile({x: player.x + offset.x, y: player.y + offset.y});
      });

      then(`the player faces ${degrees} degrees`, async ({gunsmith}) => {
        await expect.poll(async () => gunsmith.player.getAimDegrees()).toBeCloseTo(degrees, 0);
      });
    },
  );

  when("the mouse has not been moved", () => {
    then("the player faces east", async ({gunsmith}) => {
      expect(await gunsmith.player.getAimDegrees()).toBe(0);
    });
  });
});
