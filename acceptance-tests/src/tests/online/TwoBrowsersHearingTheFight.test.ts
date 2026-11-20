import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const HIT = "sfx-hit";
const CRUNCH = "sfx-damage-crunch";

// The server plays the match, so what a player hears of it comes from the events each snapshot carries (`docs/match-netcode.md`), played by the
// same sounds as a local game. The recorder is the DSL's (`sound.getPlays`), installed before the room is opened. A browser starts its audio only
// after a key or a click, so the player who is only shot at presses a key first, as anyone does before they play.
given("the first browser is watched for sounds and two browsers are in one private room", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.sound.startWatching();
    const code = await gunsmith.room.createPrivateRoom();

    await gunsmith.room.joinWithASecondBrowser(code);
  });

  when("the first player shoots the second", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(await gunsmith.room.secondBrowser().player.getPosition());
      await gunsmith.player.startFiring();
    });

    then("the first browser plays the hit confirmation, with its audio running", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.sound.getPlays(HIT)).length).toBeGreaterThan(0);

      const [play] = await gunsmith.sound.getPlays(HIT);
      expect(play?.contextState).toBe("running");
    });

    then("the first browser plays no crunch, for it took no damage", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.sound.getPlays(HIT)).length).toBeGreaterThan(0);

      expect(await gunsmith.sound.getPlays(CRUNCH)).toEqual([]);
    });
  });

  when("the second player shoots the first, who has pressed a key", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.sound.toggleMute();
      await gunsmith.sound.toggleMute();
      await gunsmith.room.secondBrowser().player.aimAtTile(await gunsmith.player.getPosition());
      await gunsmith.room.secondBrowser().player.startFiring();
    });

    then("the first browser plays the crunch of the damage, with its audio running", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.sound.getPlays(CRUNCH)).length).toBeGreaterThan(0);

      const [play] = await gunsmith.sound.getPlays(CRUNCH);
      expect(play?.contextState).toBe("running");
    });
  });
});
