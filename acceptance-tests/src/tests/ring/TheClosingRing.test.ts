import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The ring starts to close after three seconds (time to read the page before it moves) and is closed in six more. Sparring's opponent stands still and never shoots,
// so only the ring can hurt a fighter and the spec sees what the ring alone does.
const DELAY_SECONDS = 3;
const CLOSING_SECONDS = 6;

// The ring's centre is drawn from the seed, and where it falls decides who is left outside, so each outcome has a seed
// measured in the engine over seeds 0 to 39 (at a delay of one second; every time here is that plus the two seconds more of delay): seed 26 closes on a point
// one tile from the player's start, so the opponent leaves the ring at 6.1 s and falls at 11.7 s with the player never outside;
// seed 14 closes on a point one tile from the opponent's start, so the player leaves at 7.5 s and falls at 12.6 s with the
// opponent never outside. Every one of the 40 rounds the ring decided took from 11.1 to 13.5 s here.
const OPPONENT_LEFT_OUTSIDE_SEED = 26;
const PLAYER_LEFT_OUTSIDE_SEED = 14;

// The longest a round took was 13.5 game seconds; fifteen more is room for a loaded machine.
const LONGEST_ROUND_SECONDS = 13.5 + 15;

// The final radius the ring closes to is never reached while a fighter stands outside it, so this only says the ring has
// closed in a good way: the arena is 20 by 12, and its start radius is more than twelve tiles.
const CLOSED_IN_BY_TILES = 3;

given("a sparring match with a ring that starts after three seconds", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startClosingRing({
      seed: PLAYER_LEFT_OUTSIDE_SEED,
      delaySeconds: DELAY_SECONDS,
      closingSeconds: CLOSING_SECONDS,
    });
  });

  when("the match has just begun", () => {
    then("the ring is centred inside the arena", async ({gunsmith}) => {
      const arena = await gunsmith.arena.getSizeInTiles();
      const {centre} = await gunsmith.ring.get();

      expect(centre.x).toBeGreaterThan(0);
      expect(centre.x).toBeLessThan(arena.width);
      expect(centre.y).toBeGreaterThan(0);
      expect(centre.y).toBeLessThan(arena.height);
    });

    then("the ring reaches every corner of the arena", async ({gunsmith}) => {
      const arena = await gunsmith.arena.getSizeInTiles();
      const {centre, radius} = await gunsmith.ring.get();

      const reach = radius + 0.001;

      expect(Math.hypot(centre.x, centre.y)).toBeLessThanOrEqual(reach);
      expect(Math.hypot(arena.width - centre.x, centre.y)).toBeLessThanOrEqual(reach);
      expect(Math.hypot(centre.x, arena.height - centre.y)).toBeLessThanOrEqual(reach);
      expect(Math.hypot(arena.width - centre.x, arena.height - centre.y)).toBeLessThanOrEqual(reach);
    });

    then("it does no damage yet", async ({gunsmith}) => {
      expect((await gunsmith.ring.get()).damagePerSecond).toBe(0);
    });
  });

  when("the ring has started to close", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.ring.waitForClosing();
    });

    then("the screen says the ring is closing", async ({gunsmith}) => {
      expect(await gunsmith.ring.isClosingOnScreen()).toBe(true);
    });
  });

  when("the ring has closed in for a while", () => {
    let radiusAtStart = 0;

    beforeEach(async ({gunsmith}) => {
      radiusAtStart = (await gunsmith.ring.get()).radius;
      await gunsmith.ring.waitForRadiusBelow(radiusAtStart - CLOSED_IN_BY_TILES);
    });

    then("it reaches less far than it did", async ({gunsmith}) => {
      expect((await gunsmith.ring.get()).radius).toBeLessThan(radiusAtStart - CLOSED_IN_BY_TILES + 0.001);
    });

    then("it hurts whoever is outside it", async ({gunsmith}) => {
      expect((await gunsmith.ring.get()).damagePerSecond).toBeGreaterThan(0);
    });
  });
});

// At this pace the ring is still closing when it decides the round (seed 26: the opponent falls at 25.9 s, the ring has closed at
// 33 s), so a ring that went on closing after the round could be seen to; at the quicker pace above it has finished first.
const SLOW_CLOSING_SECONDS = 30;
const LONGEST_SLOW_ROUND_SECONDS = 25.9 + 15;
const FINAL_RADIUS_TILES = 2;

given("a sparring match whose ring closes slowly enough to still be closing when it decides the round", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startClosingRing({
      seed: OPPONENT_LEFT_OUTSIDE_SEED,
      delaySeconds: DELAY_SECONDS,
      closingSeconds: SLOW_CLOSING_SECONDS,
    });
  });

  when("the ring has decided the round", () => {
    let radiusAtTheEnd = 0;
    let damageAtTheEnd = 0;

    beforeEach(async ({gunsmith}) => {
      await gunsmith.round.waitForState("won", LONGEST_SLOW_ROUND_SECONDS);

      const ring = await gunsmith.ring.get();
      radiusAtTheEnd = ring.radius;
      damageAtTheEnd = ring.damagePerSecond;

      await gunsmith.clock.waitForGameSeconds(1);
    });

    then("it had not finished closing, so what follows is the round's doing", () => {
      expect(radiusAtTheEnd).toBeGreaterThan(FINAL_RADIUS_TILES);
    });

    then("it has stopped closing, though the game's clock runs on", async ({gunsmith}) => {
      expect((await gunsmith.ring.get()).radius).toBe(radiusAtTheEnd);
    });

    then("it hurts no one more than it did", async ({gunsmith}) => {
      expect((await gunsmith.ring.get()).damagePerSecond).toBe(damageAtTheEnd);
    });
  });
});

given("a sparring match whose ring closes on the player's side of the arena", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startClosingRing({
      seed: OPPONENT_LEFT_OUTSIDE_SEED,
      delaySeconds: DELAY_SECONDS,
      closingSeconds: CLOSING_SECONDS,
    });
  });

  when("the opponent is left outside the ring and the player does nothing", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.round.waitForState("won", LONGEST_ROUND_SECONDS);
    });

    then("the ring has taken all the opponent's health", async ({gunsmith}) => {
      expect((await gunsmith.opponent.get()).health).toBe(0);
    });

    then("the player is untouched", async ({gunsmith}) => {
      expect(await gunsmith.player.getHealth()).toBe(100);
    });

    then("the banner says the round is won", async ({gunsmith}) => {
      expect(await gunsmith.round.getBannerMessage()).toBe("You won");
    });
  });
});

given("a sparring match whose ring closes on the opponent's side of the arena", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startClosingRing({
      seed: PLAYER_LEFT_OUTSIDE_SEED,
      delaySeconds: DELAY_SECONDS,
      closingSeconds: CLOSING_SECONDS,
    });
  });

  when("the player stands still outside the ring", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.round.waitForState("lost", LONGEST_ROUND_SECONDS);
    });

    then("the ring has taken all the player's health", async ({gunsmith}) => {
      expect(await gunsmith.player.getHealth()).toBe(0);
    });

    then("the opponent, who was safe inside it, is untouched", async ({gunsmith}) => {
      expect((await gunsmith.opponent.get()).health).toBe(100);
    });

    then("the banner says the round is lost", async ({gunsmith}) => {
      expect(await gunsmith.round.getBannerMessage()).toBe("You lost");
    });
  });
});
