import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// Online smoothness, the first half (`docs/match-netcode.md`): the browser steps its own fighter instead of waiting to be told. The
// connection is held up 300 ms each way, so the server's word about a step reaches the page at least 600 ms after the key goes down; a
// page that only draws what it is sent is still standing where it started for all of that time, while one that predicts is already
// walking. The comparison is of states (what the page shows against the newest snapshot it has been sent), not of times.
given("two browsers are in one private room over a connection that holds every frame up 300 milliseconds", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.room.connection.slowTheConnectionBy({milliseconds: 300});
    const code = await gunsmith.room.createPrivateRoom();

    await gunsmith.room.joinWithASecondBrowser(code);
    await expect.poll(() => gunsmith.room.frames.hasReceivedSnapshots()).toBe(true);
  });

  when("the first player starts walking west", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.startWalking("west");
    });

    then("the first player is shown walking ahead of where the server last said they were", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.room.smoothness.isShownAheadOfTheServer()).toBe(true);
    });

    when("the first player stops", () => {
      beforeEach(async ({gunsmith}) => {
        await expect.poll(() => gunsmith.room.smoothness.isShownAheadOfTheServer()).toBe(true);
        await gunsmith.player.stopWalking("west");
      });

      then("the first player is shown where the server has them", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.room.smoothness.isShownWhereTheServerHasThem()).toBe(true);
      });
    });
  });
});
