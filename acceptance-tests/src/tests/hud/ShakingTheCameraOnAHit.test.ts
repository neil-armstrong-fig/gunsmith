import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A bullet that hurts the player shakes the camera: the picture moves up to 12 pixels by default and settles inside 100 ms (art's study,
// `docs/art/concepts/combat-feedback/Handover.md`: horizontal `sin(age x 180) x 2 x (1 - age / 0.1)`, vertical minus half of it). The canvas is not in the DOM, so
// the spec reads where the camera has put the picture from the canvas itself (`data-camera-shake`, written from the camera as it was applied), in a game held
// still on the moment. The ring never shakes it, `?shake=0` turns it off, and **what the player aims at never moves with it**: the aim is worked out on the
// fixed view (the user's decision, 2026-11-17), so a hit cannot nudge it.
const HIT_WATCH = {maxSeconds: 10, stepSeconds: 0.02};
// Part way through the shake, where the study's curve is far from zero for any age from 0.03 to 0.05 s.
const PART_WAY_SECONDS = 0.03;
const SHAKE_IS_OVER_SECONDS = 0.15;
// What the camera shakes by when the page says nothing (the user's choice, 2026-11-18; art's study says 2).
const DEFAULT_SHAKE_PIXELS = 12;
const THE_STUDYS_SHAKE_PIXELS = 2;
const AIM_DISTANCE_TILES = 6;

const DELAY_SECONDS = 3;
const CLOSING_SECONDS = 6;
const PLAYER_LEFT_OUTSIDE_SEED = 14;
// The ring first hurts the player at about 7.5 s of game time (`TakingDamageOnTheScreen`). A shake lasts 100 ms, so the ring is watched in the same fine steps as a
// bullet, from a little before it bites: stopped coarsely, the moment a shake started by the ring would be sampled is long past and nothing could show it.
const BEFORE_THE_RING_BITES_SECONDS = 5;
const RING_WATCH = {maxSeconds: 10, stepSeconds: 0.02};

given("a duel, held still, with the player standing in the open", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startDuel();
    await gunsmith.holdTheGame();
  });

  when("a bullet has just hurt the player and the shake is part way through", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.runUntilHurt(HIT_WATCH);
      await gunsmith.runGameFor(PART_WAY_SECONDS);
    });

    then(
      "the camera has moved the picture, by more than art's study did and no more than the strength asked for",
      async ({gunsmith}) => {
        const {x, y} = await gunsmith.camera.getShake();

        expect(Math.hypot(x, y)).toBeGreaterThan(THE_STUDYS_SHAKE_PIXELS);
        expect(Math.abs(x)).toBeLessThanOrEqual(DEFAULT_SHAKE_PIXELS);
        expect(Math.abs(y)).toBeLessThanOrEqual(DEFAULT_SHAKE_PIXELS / 2);
      },
    );

    then(
      "it moves the picture up when it moves it right, and by half as much: the study's vertical is minus half its horizontal",
      async ({gunsmith}) => {
        const {x, y} = await gunsmith.camera.getShake();

        expect(y).toBeCloseTo(-x / 2, 2);
      },
    );
  });

  when("a bullet has hurt the player and the shake has had time to end", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.runUntilHurt(HIT_WATCH);
      await gunsmith.runGameFor(SHAKE_IS_OVER_SECONDS);
    });

    then("the camera is back where it was, exactly", async ({gunsmith}) => {
      expect(await gunsmith.camera.getShake()).toEqual({x: 0, y: 0});
    });
  });
});

given("a duel, held still, with the player aiming at a place across the arena", () => {
  let aimBeforeTheHit = 0;

  beforeEach(async ({gunsmith}) => {
    await gunsmith.startDuel();
    await gunsmith.holdTheGame();

    const {x, y} = await gunsmith.player.getPosition();
    await gunsmith.player.aimAtTile({x: x + AIM_DISTANCE_TILES, y});
    await gunsmith.runGameFor(PART_WAY_SECONDS);
    aimBeforeTheHit = await gunsmith.player.getAimDegrees();
  });

  when("a bullet has just hurt the player and the camera is shaking", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.runUntilHurt(HIT_WATCH);
      await gunsmith.runGameFor(PART_WAY_SECONDS);
    });

    then("the camera really is moving the picture", async ({gunsmith}) => {
      const {x, y} = await gunsmith.camera.getShake();

      expect(Math.hypot(x, y)).toBeGreaterThan(0.1);
    });

    then("the player still aims where they did: a hit does not nudge the aim", async ({gunsmith}) => {
      expect(await gunsmith.player.getAimDegrees()).toBeCloseTo(aimBeforeTheHit, 6);
    });
  });
});

given("a duel opened with a camera that does not shake, held still", () => {
  beforeEach(async ({gunsmith}) => {
    gunsmith.keepTheCameraStill();
    await gunsmith.startDuel();
    await gunsmith.holdTheGame();
  });

  when("a bullet has just hurt the player and a shake would be part way through", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.runUntilHurt(HIT_WATCH);
      await gunsmith.runGameFor(PART_WAY_SECONDS);
    });

    then("the camera does not move the picture", async ({gunsmith}) => {
      expect(await gunsmith.camera.getShake()).toEqual({x: 0, y: 0});
    });
  });
});

given("a sparring match whose ring closes on the opponent's side of the arena, held still", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startClosingRing({
      seed: PLAYER_LEFT_OUTSIDE_SEED,
      delaySeconds: DELAY_SECONDS,
      closingSeconds: CLOSING_SECONDS,
    });
    await gunsmith.holdTheGame();
  });

  when(
    "the ring has just begun to hurt the player, who stands still outside it, and a shake would be part way through",
    () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.runGameFor(BEFORE_THE_RING_BITES_SECONDS);
        await gunsmith.player.runUntilHurt(RING_WATCH);
        await gunsmith.runGameFor(PART_WAY_SECONDS);
      });

      then("the camera does not move the picture: the ring is not a hit", async ({gunsmith}) => {
        expect(await gunsmith.camera.getShake()).toEqual({x: 0, y: 0});
      });
    },
  );
});
