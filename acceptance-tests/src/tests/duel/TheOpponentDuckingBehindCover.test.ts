import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The cover hall (see TheOpponentShootingOverCover): the opponent stands in the two tiles east of its block, seven tiles from the player, who
// faces it. A fighter crouched with a block right beside them on the line is hidden from every viewer, so a standing player who stops seeing
// an opponent that is in front of them and in range, with nothing else between, is looking at one that has ducked behind its block.
// The opponent has to stand to fire (a crouched shooter's bullets are stopped by the block), so it is seen again.
const SEEDS = [1, 4];
const OPPONENT_TILE = {x: 9.5, y: 1.5};
const WATCH = {maxSeconds: 10, stepSeconds: 0.05};
const A_FRAME_SECONDS = 0.02;

given.each(
  SEEDS,
  seed => `a cover hall (seed ${seed}), the player standing in their pocket and facing the opponent`,
  seed => {
    let seenAtFirst = false;

    beforeEach(async ({gunsmith}) => {
      await gunsmith.scenario.startCoverHall(seed);
      await gunsmith.clock.holdTheGame();

      await gunsmith.player.aimAtTile(OPPONENT_TILE);
      await gunsmith.clock.runGameFor(A_FRAME_SECONDS);
      seenAtFirst = (await gunsmith.opponent.get()).visible;
    });

    when("the opponent has fired a burst over the blocks", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.opponent.runUntilHidden(WATCH);
      });

      then(
        "the player stops seeing it, although it was in view and nothing but its cover hides it now",
        async ({gunsmith}) => {
          expect(seenAtFirst).toBe(true);
          expect((await gunsmith.opponent.get()).visible).toBe(false);
        },
      );
    });

    when("the opponent has ducked and the player keeps watching", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.opponent.runUntilHidden(WATCH);
        await gunsmith.opponent.runUntilSeen(WATCH);
      });

      then("it stands up again, which it must to fire", async ({gunsmith}) => {
        expect(seenAtFirst).toBe(true);
        expect((await gunsmith.opponent.get()).visible).toBe(true);
      });
    });
  },
);
