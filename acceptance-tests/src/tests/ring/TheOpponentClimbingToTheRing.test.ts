import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The terraced arena: low ground in the west, where the opponent starts, and a platform one level up in the east, reached by one
// stair. The player stands still on the platform and never shoots, so nothing can see them from the low ground; the ring is what
// sends the opponent up, because it closes on a point on the platform. The ring starts after a second, closes over six and hurts
// ten times as much (`?ringDamage=10`), as in `TheOpponentStayingInTheRing`, so a bot that could not climb would be killed by it
// within a few seconds and the round would be won. Measured in the engine over seeds 0 to 39: with the opponent unable to use a
// stair, these three seeds (centres on the platform) each ended with the opponent dead and the round won; with it, each ends with
// the opponent at full health on the platform and the round lost (the player, idle, is killed once the opponent reaches them).
const DELAY_SECONDS = 1;
const CLOSING_SECONDS = 6;
const DAMAGE_SCALE = 10;
const SEEDS_THAT_NEED_THE_STAIR = [9, 29, 30];

// The most the ring ever hurts at its usual strength, a second (its maximum, once closed), so more than this is the boost.
const MOST_AN_UNBOOSTED_RING_HURTS = 20;

// The longest round measured was 5.5 game seconds; fifteen more is room for a loaded machine.
const LONGEST_ROUND_SECONDS = 5.5 + 15;

// The platform is one level up from the low ground, which is level 0.
const PLATFORM_LEVEL = 1;

given.each(
  SEEDS_THAT_NEED_THE_STAIR,
  seed => `a duel (seed ${seed}) across two levels, whose ring closes on the platform and hurts ten times as much`,
  seed => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.scenario.startTerracedDuel({
        seed,
        delaySeconds: DELAY_SECONDS,
        closingSeconds: CLOSING_SECONDS,
        damageScale: DAMAGE_SCALE,
      });
    });

    when("the player stands still on the platform until the round is decided", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.round.waitForState("lost", LONGEST_ROUND_SECONDS);
      });

      then(
        "the ring was hurting more than it ever does unboosted, so reaching it in time mattered",
        async ({gunsmith}) => {
          expect((await gunsmith.ring.get()).damagePerSecond).toBeGreaterThan(MOST_AN_UNBOOSTED_RING_HURTS);
        },
      );

      then("the opponent took no damage from the ring", async ({gunsmith}) => {
        expect((await gunsmith.opponent.get()).health).toBe(100);
      });

      then("the opponent is on the platform, having climbed its stair", async ({gunsmith}) => {
        expect((await gunsmith.opponent.get()).level).toBe(PLATFORM_LEVEL);
      });
    });
  },
);
