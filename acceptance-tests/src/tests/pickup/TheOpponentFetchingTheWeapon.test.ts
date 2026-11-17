import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The pickup race: the duel's arena with the player standing still at (10.5, 6.5) and the opponent six tiles east at (16.5, 6.5),
// in sight of each other, and a weapon lying at (17.5, 10.5): four tiles from the opponent and eight from the player. The
// opponent leaves the fight to take what it will win the walk to. Before it did, it never went for it: it shot the idle player
// where it stood and the round ended with the weapon still lying there. The weapon holds thirty rounds, the rifle the opponent
// starts with twelve, so a magazine over twelve is the weapon's. Three seeds, as the other bot specs use.
const SEEDS = [2, 17, 28];

// Four tiles at the opponent's pace is about a second and a half; the rest is room for a loaded machine.
const LONGEST_WALK_SECONDS = 15;

for (const seed of SEEDS) {
  given(`a duel (seed ${seed}) with a weapon lying near the opponent and far from the player, who stands still`, () => {
    let startingRounds = 0;
    let startingHealth = 0;

    beforeEach(async ({gunsmith}) => {
      await gunsmith.startPickupRace(seed);
      startingRounds = (await gunsmith.opponent.get()).rounds;
      startingHealth = await gunsmith.player.getHealth();
    });

    then("the weapon lies in the arena to begin with", async ({gunsmith}) => {
      expect(await gunsmith.pickup.get()).toBeDefined();
    });

    when("the opponent has had time to walk to the weapon", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.pickup.waitUntilTaken(LONGEST_WALK_SECONDS);
      });

      then(
        "the opponent is holding it, with more rounds in the magazine than the weapon it began with",
        async ({gunsmith}) => {
          expect((await gunsmith.opponent.get()).rounds).toBeGreaterThan(startingRounds);
        },
      );

      then(
        "the player has not been hurt, since it left the fight for the weapon and did not shoot on the way",
        async ({gunsmith}) => {
          expect(await gunsmith.player.getHealth()).toBe(startingHealth);
        },
      );
    });
  });
}
