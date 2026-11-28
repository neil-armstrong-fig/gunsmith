import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const RELOAD = "sfx-reload";

given("the player is on the practice range", () => {
  when("they fire one shot, start a reload and ask to reload again", () => {
    beforeEach(async ({gunsmith}) => {
      const {rounds} = await gunsmith.weapon.get();
      await gunsmith.player.fire();
      await gunsmith.weapon.waitForRounds(rounds - 1);

      await gunsmith.player.reload();
      await gunsmith.weapon.waitForReloadToStart();

      await gunsmith.player.reload();
    });

    then("the reload sound starts once while the reload is still in progress", async ({gunsmith}) => {
      await expect
        .poll(() => gunsmith.sound.getPlays(RELOAD))
        .toMatchObject([{contextState: "running", looping: false}]);
      expect((await gunsmith.weapon.get()).reloading).toBe(true);
      await gunsmith.weapon.waitForReloadToEnd();
      expect(await gunsmith.sound.getPlays(RELOAD)).toHaveLength(1);
    });
  });

  when("they finish a reload and try again with a full magazine", () => {
    beforeEach(async ({gunsmith}) => {
      const {rounds} = await gunsmith.weapon.get();
      await gunsmith.player.fire();
      await gunsmith.weapon.waitForRounds(rounds - 1);

      await gunsmith.player.reload();
      await gunsmith.weapon.waitForReloadToStart();
      await gunsmith.weapon.waitForReloadToEnd();

      await gunsmith.player.reload();
      await gunsmith.clock.waitForGameSeconds(0.3);
    });

    then("the weapon stays ready and only the first reload plays a cue", async ({gunsmith}) => {
      expect((await gunsmith.weapon.get()).reloading).toBe(false);
      expect(await gunsmith.sound.getPlays(RELOAD)).toHaveLength(1);
    });
  });

  when("they reload with the game muted and unmute after the reload", () => {
    beforeEach(async ({gunsmith}) => {
      const {rounds} = await gunsmith.weapon.get();
      await gunsmith.sound.toggleMute();

      await gunsmith.player.fire();
      await gunsmith.weapon.waitForRounds(rounds - 1);

      await gunsmith.player.reload();
      await gunsmith.weapon.waitForReloadToStart();
      await gunsmith.weapon.waitForReloadToEnd();

      await gunsmith.sound.toggleMute();
      await gunsmith.clock.waitForGameSeconds(0.3);
    });

    then("nothing plays during or after the reload", async ({gunsmith}) => {
      expect(await gunsmith.sound.getPlays(RELOAD)).toHaveLength(0);
    });
  });
});
