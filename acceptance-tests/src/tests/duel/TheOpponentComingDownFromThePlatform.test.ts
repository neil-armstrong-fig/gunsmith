import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The overlook: the terraced arena with the fighters the other way round. The opponent starts on the platform, 11 tiles east of
// the player, who stands still on the low ground inside its sight. It is farther than its far range, so it closes in, and the way
// straight at the player ends at the platform's drop, where a bot with no route stands on the edge for the whole fight and shoots
// down from there; one that routes by stairs goes along the platform to the stair and comes down to the low ground, then closes in
// to its fighting range. Measured in the engine over seeds 0 to 39, with and without the route: every seed ends with the player
// dead in 2.3 to 3.9 seconds either way, and with the route the opponent ends on the low ground (level 0) west of the drop in all
// 40, without it on the platform's edge (level 1, x 11.4) in all 40. These three seeds span the round lengths.
const SEEDS = [2, 17, 28];

// The longest round measured was 3.9 game seconds; fifteen more is room for a loaded machine.
const LONGEST_ROUND_SECONDS = 3.9 + 15;

const LOW_GROUND_LEVEL = 0;

for (const seed of SEEDS) {
  given(`a duel (seed ${seed}) with the opponent on a platform and the player standing still on the low ground`, () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.startOverlookDuel(seed);
    });

    when("the round is decided", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.round.waitForState("lost", LONGEST_ROUND_SECONDS);
      });

      then("the player is still on the low ground", async ({gunsmith}) => {
        expect(await gunsmith.player.getLevel()).toBe(LOW_GROUND_LEVEL);
      });

      then(
        "the opponent has come down to the low ground by the stair, rather than staying at the drop",
        async ({gunsmith}) => {
          expect((await gunsmith.opponent.get()).level).toBe(LOW_GROUND_LEVEL);
        },
      );
    });
  });
}
