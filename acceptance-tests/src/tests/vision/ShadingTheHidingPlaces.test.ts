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

for (const seed of SEEDS) {
  given(`a cover hall (seed ${seed}) with the player standing beside their block`, () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.startCoverHall(seed);
      await gunsmith.holdTheGame();
    });

    when("the player faces the block", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.aimAtTile(OPPONENT_TILE);
        await gunsmith.runGameFor(A_TURN_SECONDS);
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
        await gunsmith.runGameFor(A_TURN_SECONDS);
        await gunsmith.bullets.runUntilNoneInTheAir(CLEAR_THE_AIR);
      });

      then("nothing is shaded behind it, since that floor is not in view", async ({gunsmith}) => {
        expect(await gunsmith.arena.getFloorBrightnessAt(BEHIND_THE_BLOCK, CLEAR_FLOOR)).toBeGreaterThan(CLEAR_ABOVE);
      });
    });
  });
}
