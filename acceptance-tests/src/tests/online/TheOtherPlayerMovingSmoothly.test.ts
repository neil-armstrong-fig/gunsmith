import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// Online smoothness, the other fighter: a browser only learns where the other player is from snapshots, and a lower snapshot rate must not
// make them move in steps. The first browser is sent only every fourth snapshot (about fifteen a second, half the rate the server is meant to run at), so a
// browser that draws the newest snapshot moves the other player 0.4 tile at a time; one that blends between two moves them evenly. What a
// viewer sees is the largest step between two frames beyond what walking explains, with the walking pace taken from the second browser's
// own snapshots and the time between frames measured, so a frame dropped under load is not a jump.
given("two browsers are in one private room and the first is sent only every fourth snapshot", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.room.receiveOnlyEveryNthSnapshot(4);
    const code = await gunsmith.room.createPrivateRoom();

    await gunsmith.room.joinWithASecondBrowser(code);
    await expect.poll(() => gunsmith.room.hasReceivedSnapshots()).toBe(true);
    await gunsmith.player.aimAtTile(await gunsmith.room.secondBrowser().player.getPosition());
    await expect.poll(() => gunsmith.room.hasBeenToldWhereTheOtherPlayerIs()).toBe(true);
    await gunsmith.room.startRecordingTheShownFighters();
  });

  when("the second player walks towards the first and stops", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.room.secondBrowser().player.walkFor("west", 0.8);
      await expect.poll(() => gunsmith.room.hasBeenToldWhereTheOtherPlayerIs()).toBe(true);
    });

    then("the first player is shown them moving without jumps", async ({gunsmith}) => {
      expect(gunsmith.room.secondBrowser().room.getFastestServerMovement()).toBeGreaterThan(0);
      expect(await gunsmith.room.getShownOpponentSamples()).toBeGreaterThan(10);
      expect(await gunsmith.room.getLargestShownOpponentJump()).toBeLessThan(0.25);
    });
  });
});
