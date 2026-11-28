import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The cover hall: the player stands at (2.5, 1.5) beside a low cover block that fills the tile from x 3 to 4. A crouched fighter within a tile behind that
// block, in the tile from x 4 to 5, is hidden from the player, so the floor there is shaded a little darker to suggest where one could be. The floor from
// x 5 on shows nothing hides, and is the clear floor to compare with.
const SEEDS = [1, 4];
const BEHIND_THE_BLOCK = {x: 4.5, y: 1.5};
const CLEAR_FLOOR = {x: 5.5, y: 1.5};
const OPPONENT_TILE = {x: 9.5, y: 1.5};
const BEHIND_THE_PLAYER = {x: 1.5, y: 1.5};
// Long enough for the game to take the turn and draw it: one frame was not always enough.
const A_TURN_SECONDS = 0.1;
// The opponent shoots along the hall, and a shot drawn over the floor would change what is read there, so the game is run on until the air is clear.
const CLEAR_THE_AIR = {maxSeconds: 5, stepSeconds: 0.02};
// The tint takes about a fifth off the brightness. Shaded means under this, and clear means over the second.
const SHADED_BELOW = 0.92;
const CLEAR_ABOVE = 0.97;

given.each(
  SEEDS,
  seed => `a cover hall (seed ${seed}) with the player standing beside their block`,
  seed => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.scenario.startCoverHall(seed);
      await gunsmith.clock.holdTheGame();
    });

    when("the player faces the block", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.aimAtTile(OPPONENT_TILE);
        await gunsmith.clock.runGameFor(A_TURN_SECONDS);
        await gunsmith.bullets.runUntilNoneInTheAir(CLEAR_THE_AIR);
      });

      then(
        "the floor just behind it, where a crouched fighter would be hidden, is shaded darker",
        async ({gunsmith}) => {
          expect(await gunsmith.arena.getFloorBrightnessAt(BEHIND_THE_BLOCK, CLEAR_FLOOR)).toBeLessThan(SHADED_BELOW);
        },
      );

      then("the floor farther on, where nothing hides anyone, is not shaded", async ({gunsmith}) => {
        expect(await gunsmith.arena.getFloorBrightnessAt({x: 6.5, y: 1.5}, CLEAR_FLOOR)).toBeGreaterThan(CLEAR_ABOVE);
      });
    });

    when("the player turns away so that the block is out of view", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.aimAtTile(BEHIND_THE_PLAYER);
        await gunsmith.clock.runGameFor(A_TURN_SECONDS);
        await gunsmith.bullets.runUntilNoneInTheAir(CLEAR_THE_AIR);
      });

      then("nothing is shaded behind it, since that floor is not in view", async ({gunsmith}) => {
        expect(await gunsmith.arena.getFloorBrightnessAt(BEHIND_THE_BLOCK, CLEAR_FLOOR)).toBeGreaterThan(CLEAR_ABOVE);
      });
    });
  },
);

// The heights arena: a platform one level up fills the east end from x = 10, and a second on the same level fills the north-west
// corner (x 1 to 4, y 4 to 6), with a low cover block on the low ground at the foot of its east face (x 4 to 5, y 5 to 6). From 1.5
// back on the east platform the player sees all of the corner platform, the floor just behind the block among it: but a block on the
// low ground hides nobody up on a platform, however near, so nothing there is shaded. The far corner of the same platform is the clear
// floor to compare with.
const BEHIND_THE_LOW_BLOCK = {x: 3.6, y: 5.6};
const CORNER_PLATFORM_FLOOR = {x: 2.5, y: 4.7};
const ON_THE_EAST_PLATFORM = 11.5;
const WALK_WATCH = {maxSeconds: 5, stepSeconds: 0.02};

given("the heights arena, with a low cover block on the low ground at the foot of the corner platform", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startHeights();
    await gunsmith.clock.holdTheGame();
  });

  when("the player climbs onto the east platform and faces the corner platform across the block", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.walkUntilPast({heading: "east", limit: ON_THE_EAST_PLATFORM, watch: WALK_WATCH});
      await gunsmith.player.aimAtTile(BEHIND_THE_LOW_BLOCK);
      await gunsmith.clock.runGameFor(A_TURN_SECONDS);
    });

    then(
      "the platform's floor just behind the block is not shaded, since a block below it hides nobody up there",
      async ({gunsmith}) => {
        expect(await gunsmith.arena.getFloorBrightnessAt(BEHIND_THE_LOW_BLOCK, CORNER_PLATFORM_FLOOR)).toBeGreaterThan(
          CLEAR_ABOVE,
        );
      },
    );
  });
});
