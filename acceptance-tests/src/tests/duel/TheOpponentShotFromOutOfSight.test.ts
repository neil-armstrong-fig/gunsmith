import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The overwatch: a corridor one tile wide. The opponent wanders on its low ground, ten tiles west of the player, who stands still at
// the edge of the platform at the east end (a shot from back on it would fly over the low ground) and fires west along the row:
// every shot along it hits, wherever the opponent has wandered to, and it is farther than it can see (eight tiles), so the player is
// out of its sight. A player at the edge can be seen from below, so a wandering opponent that comes near sees them: measured in the
// engine over seeds 0 to 39 with the player idle, it never stopped wandering within fifteen seconds in only two of them, these.
const SEEDS = [13, 14];

// Straight along the corridor's row, west of the opponent's whole reach.
const ALONG_THE_ROW = {x: 20.5, y: 1.5};

// The opponent stops wandering within a step of the first hit, and the old one never did in fifteen seconds; five is room for a
// loaded machine.
const LONGEST_WAIT_SECONDS = 5;

// The player cannot stop at the first hit: the trigger is still down while the browser notices it, and the rounds already in the
// air hurt the opponent too (four shots were fired, enough to win the round). So what is asserted is that the opponent has left
// "wander" by the time it is hurt, not that it comes up the stair afterwards, which the engine's step tests cover.
given.each(
  SEEDS,
  seed => `an overwatch (seed ${seed}), the opponent wandering out of the player's sight`,
  seed => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.scenario.startOverwatch(seed);
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
  },
);
