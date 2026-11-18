import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The overwatch: a corridor one tile wide. The opponent wanders on its low ground, ten tiles west of the player, who stands still on
// the platform at the east end and fires west along the row: every shot along it hits, wherever the opponent has wandered to, and it is
// farther than it can see (eight tiles), so the player is out of its sight. Measured in the engine over seeds 0 to 39, with the
// opponent's reaction to a shot switched off, it never stopped wandering within fifteen seconds in 19 of them and took one to
// fourteen seconds in the rest; with it, it stopped within one step in all 40. These three seeds are among the 19.
const SEEDS = [2, 5, 7];

// Straight along the corridor's row, west of the opponent's whole reach.
const ALONG_THE_ROW = {x: 20.5, y: 1.5};

// The opponent stops wandering within a step of the first hit, and the old one never did in fifteen seconds; five is room for a
// loaded machine.
const LONGEST_WAIT_SECONDS = 5;

// The player cannot stop at the first hit: the trigger is still down while the browser notices it, and the rounds already in the
// air hurt the opponent too (four shots were fired, enough to win the round). So what is asserted is that the opponent has left
// "wander" by the time it is hurt, not that it comes up the stair afterwards, which the engine's step tests cover.
for (const seed of SEEDS) {
  given(`an overwatch (seed ${seed}), the opponent wandering out of the player's sight`, () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.startOverwatch(seed);
    });

    when("the player fires down the corridor until a shot hurts the opponent, then stops", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.aimAtTile(ALONG_THE_ROW);
        await gunsmith.player.startFiring();
        await gunsmith.opponent.waitForHealthBelow(100);
        await gunsmith.player.stopFiring();
      });

      then("the opponent stops wandering, though it still cannot see the player", async ({gunsmith}) => {
        await gunsmith.opponent.waitForBehaviourOtherThan("wander", LONGEST_WAIT_SECONDS);

        expect((await gunsmith.opponent.get()).behaviour).not.toBe("wander");
      });
    });
  });
}
