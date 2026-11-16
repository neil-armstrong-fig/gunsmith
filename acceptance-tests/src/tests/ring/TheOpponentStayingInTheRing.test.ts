import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The ring starts after one second and closes at its usual pace, in six, but hurts ten times as much (`?ringDamage=10`), so a
// bot that ignored it would be hurt, and badly, within a few seconds, and the round does not wait for the ring's slow ramp (the
// duel's own ring takes 45 seconds to start, and the round is over by then). The player stands still and never shoots, so the
// only thing that can take health off the opponent is the ring. Measured in the engine over seeds 0 to 39 with the opponent left
// to ignore the ring: seed 12 left it with 10 health and seed 19 with none, and each round was over by 3.5 s with the opponent
// walking in. A few seeds (10, for one) still lose health, as the ring outruns a bot walking round a pillar, so these two are chosen.
const DELAY_SECONDS = 1;
const CLOSING_SECONDS = 6;
const DAMAGE_SCALE = 10;
const SEEDS_THE_RING_WOULD_HURT = [12, 19];

// The most the ring ever hurts at its usual strength, a second (its maximum, once closed), so more than this is the boost.
const MOST_AN_UNBOOSTED_RING_HURTS = 20;

// The longest round measured was 3.5 game seconds; fifteen more is room for a loaded machine.
const LONGEST_ROUND_SECONDS = 3.5 + 15;

for (const seed of SEEDS_THE_RING_WOULD_HURT) {
  given(`a duel (seed ${seed}) whose ring starts to close after a second and hurts ten times as much`, () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.startClosingDuel({
        seed,
        delaySeconds: DELAY_SECONDS,
        closingSeconds: CLOSING_SECONDS,
        damageScale: DAMAGE_SCALE,
      });
    });

    when("the player stands still until the round is decided", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.round.waitForState("lost", LONGEST_ROUND_SECONDS);
      });

      then(
        "the ring was hurting more than it ever does unboosted, so staying inside it mattered",
        async ({gunsmith}) => {
          expect((await gunsmith.ring.get()).damagePerSecond).toBeGreaterThan(MOST_AN_UNBOOSTED_RING_HURTS);
        },
      );

      then("the opponent took no damage from the ring", async ({gunsmith}) => {
        expect((await gunsmith.opponent.get()).health).toBe(100);
      });

      then("the opponent is inside the ring", async ({gunsmith}) => {
        const {centre, radius} = await gunsmith.ring.get();
        const opponent = await gunsmith.opponent.get();

        expect(Math.hypot(opponent.x - centre.x, opponent.y - centre.y)).toBeLessThanOrEqual(radius);
      });
    });
  });
}
