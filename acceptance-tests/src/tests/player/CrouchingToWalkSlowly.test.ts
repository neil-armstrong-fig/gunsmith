import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A short walk, west then east, along the row the player starts on: clear floor for several tiles either way.
const SECONDS_WALKING = 0.4;

// Crouching must cost a lot of speed (the user's wording is "substantially"), so the line is well below the standing pace.
const MUCH_SLOWER = 0.6;

given("a sparring match has just begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startSparring();
  });

  when("the player walks standing and then crouches and walks", () => {
    let standingSpeed = 0;
    let crouchedSpeed = 0;

    beforeEach(async ({gunsmith}) => {
      standingSpeed = await gunsmith.player.measureWalkingSpeed("west", SECONDS_WALKING);
      await gunsmith.player.crouch();
      crouchedSpeed = await gunsmith.player.measureWalkingSpeed("east", SECONDS_WALKING);
    });

    then("the player walks, but much slower than standing", () => {
      expect(crouchedSpeed).toBeGreaterThan(0);
      expect(crouchedSpeed).toBeLessThan(standingSpeed * MUCH_SLOWER);
    });
  });

  when("the player crouches, stands up again and walks", () => {
    let standingSpeed = 0;
    let speedAfterStandingUp = 0;

    beforeEach(async ({gunsmith}) => {
      standingSpeed = await gunsmith.player.measureWalkingSpeed("west", SECONDS_WALKING);

      await gunsmith.player.crouch();
      await gunsmith.player.standUp();

      speedAfterStandingUp = await gunsmith.player.measureWalkingSpeed("east", SECONDS_WALKING);
    });

    then("the player walks as fast as before", () => {
      expect(speedAfterStandingUp).toBeCloseTo(standingSpeed, 1);
    });
  });
});
