import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The fair duel is fixture A of art's fairness study: 21 by 13 tiles, a platform one level up in the middle with a stair on each
// of its ends, and the same picture turned half way round. The fighters start at a matching pair of places: the opponent where
// the player would be if the arena were turned, so on world points the two add up to (21, 13). The pair and who takes which end
// are drawn from the seed. The player stands still, so the player's own place is exact. The opponent has a brain and may have
// walked before the page could be read, so its place is compared with room for as far as anyone can walk in the game time that
// had passed (read after the places, so never too little): nobody walks faster than 6 tiles a second.
const SEEDS = [2, 17, 28];
const ARENA_CENTRE = {x: 10.5, y: 6.5};
const FASTEST_WALK_IN_TILES_PER_SECOND = 6;
// The pair is at least 10 steps apart on foot, and a step is at most one tile along either axis: 10 / sqrt(2) in a straight line.
const NEAREST_THE_FIGHTERS_START = 7;

for (const seed of SEEDS) {
  given(`a fair duel (seed ${seed}) that has just begun`, () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.startFairDuel(seed);
    });

    then("both fighters stand on the low ground", async ({gunsmith}) => {
      expect(await gunsmith.player.getLevel()).toBe(0);
      expect((await gunsmith.opponent.get()).level).toBe(0);
    });

    then("each stands where the other would if the arena were turned half way round", async ({gunsmith}) => {
      const player = await gunsmith.player.getPosition();
      const opponent = await gunsmith.opponent.get();
      const walkedAtMost = FASTEST_WALK_IN_TILES_PER_SECOND * (await gunsmith.round.getElapsedSeconds());

      expect(Math.hypot(player.x + opponent.x - 21, player.y + opponent.y - 13)).toBeLessThanOrEqual(
        walkedAtMost + 0.01,
      );
    });

    then("the two are well apart, not on the same place", async ({gunsmith}) => {
      const player = await gunsmith.player.getPosition();
      const opponent = await gunsmith.opponent.get();
      const walkedAtMost = FASTEST_WALK_IN_TILES_PER_SECOND * (await gunsmith.round.getElapsedSeconds());

      expect(Math.hypot(player.x - opponent.x, player.y - opponent.y)).toBeGreaterThanOrEqual(
        NEAREST_THE_FIGHTERS_START - walkedAtMost,
      );
    });

    then("the player faces the middle of the arena", async ({gunsmith}) => {
      const player = await gunsmith.player.getPosition();
      const towardsTheMiddle = (Math.atan2(ARENA_CENTRE.y - player.y, ARENA_CENTRE.x - player.x) * 180) / Math.PI;

      expect(Math.abs((await gunsmith.player.getAimDegrees()) - towardsTheMiddle)).toBeLessThan(0.5);
    });

    when("the same fair duel is opened again", () => {
      let firstPlace = {x: 0, y: 0};

      beforeEach(async ({gunsmith}) => {
        firstPlace = await gunsmith.player.getPosition();
        await gunsmith.startFairDuel(seed);
      });

      then("the player starts in the same place", async ({gunsmith}) => {
        expect(await gunsmith.player.getPosition()).toEqual(firstPlace);
      });
    });
  });
}

given("fair duels of several seeds have each just begun", () => {
  const places = new Set<string>();

  beforeEach(async ({gunsmith}) => {
    for (const seed of SEEDS) {
      await gunsmith.startFairDuel(seed);
      const {x, y} = await gunsmith.player.getPosition();
      places.add(`${x},${y}`);
    }
  });

  then("they do not all begin with the player in the same place", () => {
    expect(places.size).toBeGreaterThan(1);
  });
});
