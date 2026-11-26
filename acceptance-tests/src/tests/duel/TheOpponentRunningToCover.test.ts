import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The cover run: open low ground with one low cover block and nothing else that hides anyone. The opponent starts in the player's view
// (pinned by the webapp's scenario test: the game runs about three seconds before `holdTheGame` holds it, and the opponent is behind
// the block by then), two tiles past the block, with an empty magazine, so it reloads first. A standing viewer sees over a block, so an
// opponent hidden from them on the tile right behind it has run there and crouched. Once reloaded it stays and ducks between bursts.
const SEEDS = [1, 4];
const OPPONENT_START = {x: 13.5, y: 3.5};
// The block fills the tile from x 10 to 11 on the opponent's row; the tile right behind it, on the far side from the player, runs to x 12.
const BEHIND_THE_BLOCK = {fromX: 11, toX: 12};
const WATCH = {maxSeconds: 5, stepSeconds: 0.05};

for (const seed of SEEDS) {
  given(`a cover run (seed ${seed}), the player standing and facing the opponent, who must reload`, () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.startCoverRun(seed);
      await gunsmith.holdTheGame();
      await gunsmith.player.aimAtTile(OPPONENT_START);
    });

    when("the opponent has gone to reload", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.opponent.runUntilHidden(WATCH);
      });

      then(
        "it has left the open for the tile right behind the block, where the player cannot see it",
        async ({gunsmith}) => {
          const opponent = await gunsmith.opponent.get();

          expect(opponent.visible).toBe(false);
          expect(opponent.x).toBeGreaterThan(BEHIND_THE_BLOCK.fromX);
          expect(opponent.x).toBeLessThan(BEHIND_THE_BLOCK.toX);
        },
      );
    });
  });
}
