import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const EMPTY_CLICK = "sfx-empty-click";

given("a match has just begun", () => {
  when("the player holds the trigger at a wall until the magazine is empty and keeps holding it", () => {
    beforeEach(async ({gunsmith}) => {
      const player = await gunsmith.player.getPosition();

      await gunsmith.player.aimAtTile({x: player.x, y: player.y + 3});
      await gunsmith.player.startFiring();
      await gunsmith.weapon.waitForRounds(0);
    });

    then("the weapon clicks once, and the audio is running when it does", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.sound.getPlays(EMPTY_CLICK)).length).toBe(1);

      expect((await gunsmith.sound.getPlays(EMPTY_CLICK)).map(play => play.contextState)).toEqual(["running"]);
      expect((await gunsmith.sound.getPlays(EMPTY_CLICK)).map(play => new URL(play.url).pathname)).toEqual([
        expect.stringMatching(/\/sfx-empty-click[^/]*\.mp3$/),
      ]);
    });

    then("it does not click again, however long the trigger stays held", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.sound.getPlays(EMPTY_CLICK)).length).toBe(1);
      await gunsmith.clock.waitForGameSeconds(1);

      expect(await gunsmith.sound.getPlays(EMPTY_CLICK)).toHaveLength(1);
    });

    when("the player lets go of the trigger and pulls it again", () => {
      beforeEach(async ({gunsmith}) => {
        await expect.poll(async () => (await gunsmith.sound.getPlays(EMPTY_CLICK)).length).toBe(1);

        await gunsmith.player.stopFiring();
        // Let the fixed-step loop observe the release before the next press.
        await gunsmith.clock.waitForGameSeconds(0.05);
        await gunsmith.player.startFiring();
      });

      then("the weapon clicks once more", async ({gunsmith}) => {
        await expect.poll(async () => (await gunsmith.sound.getPlays(EMPTY_CLICK)).length).toBe(2);
        await gunsmith.clock.waitForGameSeconds(1);

        expect(await gunsmith.sound.getPlays(EMPTY_CLICK)).toHaveLength(2);
      });
    });

    when("the player reloads and the magazine runs dry again with the trigger still held", () => {
      beforeEach(async ({gunsmith}) => {
        await expect.poll(async () => (await gunsmith.sound.getPlays(EMPTY_CLICK)).length).toBe(1);

        await gunsmith.player.reload();
        await gunsmith.weapon.waitForReloadToStart();
        await gunsmith.weapon.waitForReloadToEnd();
        await gunsmith.weapon.waitForRounds(0);
      });

      then("the hold has already clicked, so it does not click a second time", async ({gunsmith}) => {
        await gunsmith.clock.waitForGameSeconds(1);

        expect(await gunsmith.sound.getPlays(EMPTY_CLICK)).toHaveLength(1);
      });
    });
  });

  when("the player holds the trigger at a wall until the magazine is empty with the sound muted", () => {
    beforeEach(async ({gunsmith}) => {
      const player = await gunsmith.player.getPosition();

      await gunsmith.sound.toggleMute();
      await gunsmith.player.aimAtTile({x: player.x, y: player.y + 3});
      await gunsmith.player.startFiring();
      await gunsmith.weapon.waitForRounds(0);
    });

    then("the weapon makes no sound", async ({gunsmith}) => {
      await gunsmith.clock.waitForGameSeconds(1);

      expect(await gunsmith.sound.getPlays(EMPTY_CLICK)).toHaveLength(0);
    });
  });

  when("the player pulls the trigger on a weapon that still has rounds", () => {
    beforeEach(async ({gunsmith}) => {
      const player = await gunsmith.player.getPosition();
      const {rounds} = await gunsmith.weapon.get();

      await gunsmith.player.aimAtTile({x: player.x, y: player.y + 3});
      await gunsmith.player.fire();
      await gunsmith.weapon.waitForRounds(rounds - 1);
    });

    then("it does not click", async ({gunsmith}) => {
      await gunsmith.clock.waitForGameSeconds(0.5);

      expect(await gunsmith.sound.getPlays(EMPTY_CLICK)).toHaveLength(0);
    });
  });
});
