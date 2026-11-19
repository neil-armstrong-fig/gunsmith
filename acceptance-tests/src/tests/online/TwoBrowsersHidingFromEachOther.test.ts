import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The first online criterion, and the privacy one (`docs/match-netcode.md`, principle 2): the server sends a browser only
// what that player can see. It reads what each browser was SENT, the frames on its WebSocket, never what the page draws or
// the state hook says: a client handed a hidden opponent and told to hide it would pass those. A snapshot with nobody in it
// proves nothing from a dead socket, so each absence is paired with snapshots having arrived.
given("two browsers are in one private room", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom();

    await gunsmith.room.joinWithASecondBrowser(code);
  });

  then("the server is sending the first browser snapshots", async ({gunsmith}) => {
    await expect.poll(() => gunsmith.room.hasReceivedSnapshots()).toBe(true);
  });

  when("the first player faces the second", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(await gunsmith.room.secondBrowser().player.getPosition());
    });

    then("the first browser is told where the second player is", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.room.hasBeenToldWhereTheOtherPlayerIs()).toBe(true);
    });
  });

  when("the first player turns their back on the second", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAwayFrom(await gunsmith.room.secondBrowser().player.getPosition());
    });

    then("the server sends the first browser snapshots without the second player in them", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.room.hasReceivedSnapshots()).toBe(true);
      await expect.poll(() => gunsmith.room.hasBeenToldWhereTheOtherPlayerIs()).toBe(false);
    });
  });
});
