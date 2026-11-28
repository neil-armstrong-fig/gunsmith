import type {OpponentSnapshot} from "@gunsmith/shared/state-hook/types/OpponentSnapshot";
import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const HIT = "sfx-hit";
const HIT_WATCH = {maxSeconds: 5, stepSeconds: 0.02};
const GAME_SECONDS_AFTER_AIMING = 0.05;
const GAME_SECONDS_AFTER_FIRING = 0.03;
const GAME_SECONDS_TO_LISTEN = 0.5;
const TILES_TO_TURN_AWAY = 4;

// A hit confirmation is heard only for a target the player sees: a target hurt out of sight makes no sound (the engine reports no `hitLanded` for it). The game is held
// still on the moment so a turn can be made between the shot and its landing, as `HittingATargetOnTheScreen` does; the audio recorder is the DSL's (`sound.getPlays`).
given("a sparring match, held still, with the player aiming at the opponent a few tiles away", () => {
  let opponent: OpponentSnapshot;

  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startSparring();
    await gunsmith.clock.holdTheGame();
    opponent = await gunsmith.opponent.get();

    await gunsmith.player.aimAtTile(opponent);
    await gunsmith.clock.runGameFor(GAME_SECONDS_AFTER_AIMING);
  });

  when("the player's bullet has landed on the opponent", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.fire();
      await gunsmith.opponent.runUntilHurt(HIT_WATCH);
      await gunsmith.clock.runGameFor(GAME_SECONDS_TO_LISTEN);
    });

    then("the hit sounds once, and the audio is running when it does", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.sound.getPlays(HIT)).length).toBe(1);

      const [play] = await gunsmith.sound.getPlays(HIT);
      expect(play?.contextState).toBe("running");
      expect(new URL(play?.url ?? "").pathname).toMatch(/\/sfx-hit[^/]*\.mp3$/);
    });

    then("nothing crunches, for the player took no damage", async ({gunsmith}) => {
      expect(await gunsmith.sound.getPlays("sfx-damage-crunch")).toHaveLength(0);
    });
  });

  when("the sound is muted and the player's bullet has landed on the opponent", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.sound.toggleMute();

      await gunsmith.player.fire();
      await gunsmith.opponent.runUntilHurt(HIT_WATCH);

      await gunsmith.clock.runGameFor(GAME_SECONDS_TO_LISTEN);
    });

    then("nothing sounds", async ({gunsmith}) => {
      expect(await gunsmith.sound.getPlays(HIT)).toHaveLength(0);
    });
  });

  when("the player has fired and turns away before the bullet lands, so the opponent is hurt out of sight", () => {
    beforeEach(async ({gunsmith}) => {
      const player = await gunsmith.player.getPosition();

      await gunsmith.player.fire();
      await gunsmith.clock.runGameFor(GAME_SECONDS_AFTER_FIRING);
      await gunsmith.player.aimAtTile({x: player.x - TILES_TO_TURN_AWAY, y: player.y});
      await gunsmith.opponent.runUntilHurt(HIT_WATCH);
      await gunsmith.clock.runGameFor(GAME_SECONDS_TO_LISTEN);
    });

    then("the opponent is hurt and cannot be seen", async ({gunsmith}) => {
      const hurt = await gunsmith.opponent.get();

      expect(hurt.health).toBeLessThan(opponent.health);
      expect(hurt.visible).toBe(false);
    });

    then("no hit sounds: the sound must not say a hit landed on what the player cannot see", async ({gunsmith}) => {
      expect(await gunsmith.sound.getPlays(HIT)).toHaveLength(0);
    });
  });
});
