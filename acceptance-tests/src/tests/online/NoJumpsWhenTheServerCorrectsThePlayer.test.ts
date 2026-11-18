import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// Online smoothness, the second half: the server's word and the browser's guess differ a little whenever frames arrive unevenly, and the
// browser corrects toward the server. The correction must not show as a jump, and a browser that lines the server's count of its inputs
// up wrongly would show jumps of several tiles. The connection holds frames up 120 ms and, in a fixed uneven pattern, up to 80 ms more,
// so there is always something to correct. What a viewer sees is the largest step between two frames beyond what walking explains, with
// the walking pace taken from the server's own snapshots (never a number written here: walking speed is a tunable) and the time between
// the frames measured, so a frame dropped under load is not a jump. A disagreement under a tile (`correctionOffset`) is eased out over a
// fifth of a second and one over a tile is put right at once, and here the two differ by well under a tile (an input arriving 80 ms late
// puts the server about half a tile out). So the bar is just under the tile where a correction stops being eased: a jump that size is a
// browser that put the player right at once, which is what lining the count up wrongly would do. How gently the ease itself runs is in the
// unit tests: a frame stalled under load takes a bigger bite of it, which is no jump.
given("two browsers are in one private room over a connection that holds frames up unevenly", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.room.slowTheConnectionBy({milliseconds: 120, jitterMilliseconds: 80});
    const code = await gunsmith.room.createPrivateRoom();

    await gunsmith.room.joinWithASecondBrowser(code);
    await expect.poll(() => gunsmith.room.hasReceivedSnapshots()).toBe(true);
    await gunsmith.room.startRecordingTheShownFighters();
  });

  when("the first player walks west for a while and stops", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.walkFor("west", 1.2);
      await expect.poll(() => gunsmith.room.isShownWhereTheServerHasThem()).toBe(true);
    });

    then("the first player is never shown jumping", async ({gunsmith}) => {
      expect(gunsmith.room.getFastestServerMovement()).toBeGreaterThan(0);
      expect(await gunsmith.room.getLargestShownJump()).toBeLessThan(0.9);
    });
  });
});
