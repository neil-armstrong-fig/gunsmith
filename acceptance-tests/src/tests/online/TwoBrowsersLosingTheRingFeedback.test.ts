import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const RING_LOOP = "sfx-ring-damage-loop";

given("the first player is taking ring damage in a private room", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.sound.startWatching();
    await gunsmith.room.connection.prepareToLoseTheConnection();
    const code = await gunsmith.room.createPrivateRoom({ringDelaySeconds: 1, ringClosingSeconds: 4});

    await gunsmith.room.joinWithASecondBrowser(code);
    await gunsmith.sound.toggleMute();
    await gunsmith.sound.toggleMute();
    await expect
      .poll(() => gunsmith.sound.getPlays(RING_LOOP))
      .toMatchObject([{contextState: "running", looping: true, ended: false}]);
    await gunsmith.hud.waitForBorder();
    expect((await gunsmith.player.getDamageOnScreen()).highlightPoints).toBeGreaterThan(0);
  });

  when("the first player's connection drops and stays down", () => {
    beforeEach(async ({gunsmith}) => {
      gunsmith.room.connection.keepTheConnectionDown();
      await expect.poll(() => gunsmith.room.connection.isToldItIsReconnecting()).toBe(true);
    });

    then("the ring damage loop ends", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.sound.getPlays(RING_LOOP)).toMatchObject([{ended: true}]);
    });

    then("the health border and the highlight round the player go away", async ({gunsmith}) => {
      await gunsmith.hud.waitForNoBorder();
      expect((await gunsmith.player.getDamageOnScreen()).highlightPoints).toBe(0);
    });

    when("the connection returns while the ring is still hurting the player", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.hud.waitForNoBorder();
        await expect.poll(() => gunsmith.sound.getPlays(RING_LOOP)).toMatchObject([{ended: true}]);
        gunsmith.room.connection.letTheConnectionBack();
        await gunsmith.room.connection.waitForTheMatchAgain();
      });

      then("both visual cues come back with one fresh loop", async ({gunsmith}) => {
        await expect
          .poll(() => gunsmith.sound.getPlays(RING_LOOP))
          .toMatchObject([{ended: true}, {contextState: "running", looping: true, ended: false}]);
        await gunsmith.hud.waitForBorder();
        expect((await gunsmith.player.getDamageOnScreen()).highlightPoints).toBeGreaterThan(0);
      });
    });
  });
});
