import {beforeEach, expect, given, then} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A room's round has a closing ring, as a duel against the opponent does: the server draws it from the round's seed and both browsers are
// told the same one, which is public (a ring has no fog). The room's real ring starts after 45 seconds and takes 30 to close, so the room is
// asked for a ring that starts after a second and closes in four (`?ringDelay=`, `?ringClosing=`). Nobody shoots in these criteria, so any health
// a player loses is the ring's.
given("two browsers are in one private room whose ring closes in a few seconds", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom({ringDelaySeconds: 1, ringClosingSeconds: 4});

    await gunsmith.room.joinWithASecondBrowser(code);
    await expect.poll(() => gunsmith.room.frames.hasReceivedSnapshots()).toBe(true);
  });

  then("both browsers are shown a ring closing on the same place", async ({gunsmith}) => {
    const second = gunsmith.room.secondBrowser();

    await expect.poll(() => gunsmith.ring.exists()).toBe(true);
    await expect.poll(() => second.ring.exists()).toBe(true);
    expect((await second.ring.get()).centre).toEqual((await gunsmith.ring.get()).centre);
  });

  then("a player who stands still while it closes loses health to it", async ({gunsmith}) => {
    await gunsmith.player.waitForHealthBelow(100, 30);
  });

  then("the other player loses health to it too, with nobody shooting", async ({gunsmith}) => {
    await gunsmith.room.secondBrowser().player.waitForHealthBelow(100, 30);
  });
});
