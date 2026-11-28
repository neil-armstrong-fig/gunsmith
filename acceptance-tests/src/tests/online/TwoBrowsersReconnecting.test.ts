import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A player whose connection drops, or who closes the tab and comes back, has a seat the server keeps for them (`docs/match-netcode.md`,
// "Reconnect and forfeits"): the same fighter, in the same place, with the match as it was. The first player is the one who is away.
// Walking is at 6 tiles a second, so a fighter that kept walking while its player was away would be several tiles on.
const SAME_PLACE_WITHIN_TILES = 1.5;
const WALKED_AT_LEAST_TILES = 1;
const AWAY_FOR_SECONDS = 1.5;

given("two browsers are in one private room, and the first one's connection can be cut", () => {
  let code = "";

  beforeEach(async ({gunsmith}) => {
    await gunsmith.room.connection.prepareToLoseTheConnection();
    code = await gunsmith.room.createPrivateRoom();

    await gunsmith.room.joinWithASecondBrowser(code);
    await gunsmith.room.waitForTheMatch();
  });

  when("the first player has walked a little, and their connection is cut", () => {
    let placeBefore = {x: 0, y: 0};

    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.walkFor("east", 0.5);
      placeBefore = await gunsmith.player.getPosition();
      gunsmith.room.connection.cutTheConnection();
      await gunsmith.room.connection.waitForTheMatchAgain();
    });

    then("the page is back in the match without being asked, in its own place", async ({gunsmith}) => {
      await expect
        .poll(async () => {
          const place = await gunsmith.player.getPosition();

          return Math.hypot(place.x - placeBefore.x, place.y - placeBefore.y);
        })
        .toBeLessThan(SAME_PLACE_WITHIN_TILES);
    });

    then("the match is as it was: the same round, the same score", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.round.getState()).toBe("playing");
      expect(await gunsmith.match.getScore()).toEqual({playerWins: 0, opponentWins: 0, round: 1});
    });

    when("the first player walks the other way", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.walkFor("west", 0.5);
      });

      then("the server plays what the player asks for again", async ({gunsmith}) => {
        await expect
          .poll(async () => {
            const place = await gunsmith.player.getPosition();

            return Math.hypot(place.x - placeBefore.x, place.y - placeBefore.y);
          })
          .toBeGreaterThan(WALKED_AT_LEAST_TILES);
        await expect.poll(() => gunsmith.room.smoothness.isShownWhereTheServerHasThem()).toBe(true);
      });
    });
  });

  when("the first player's connection is cut and stays down for a while", () => {
    beforeEach(({gunsmith}) => {
      gunsmith.room.connection.keepTheConnectionDown();
    });

    then("the page tells the player the connection is being made again", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.room.connection.isToldItIsReconnecting()).toBe(true);
    });

    when("the connection comes back", () => {
      beforeEach(async ({gunsmith}) => {
        await expect.poll(() => gunsmith.room.connection.isToldItIsReconnecting()).toBe(true);
        gunsmith.room.connection.letTheConnectionBack();
        await gunsmith.room.connection.waitForTheMatchAgain();
      });

      then("the page stops saying so, and the match goes on", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.room.connection.isToldItIsReconnecting()).toBe(false);
        expect(await gunsmith.round.getState()).toBe("playing");
      });
    });
  });

  when("the first player leaves the room while walking, and a stranger tries the room while they are away", () => {
    let placeWhenLeaving = {x: 0, y: 0};

    beforeEach(async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      await gunsmith.player.startWalking("east");
      await expect.poll(async () => (await gunsmith.player.getPosition()).x).toBeGreaterThan(11.5);
      placeWhenLeaving = await gunsmith.player.getPosition();
      const secondsWhenLeaving = await second.round.getElapsedSeconds();

      await gunsmith.room.leaveTheRoom();
      await expect.poll(() => second.round.getElapsedSeconds()).toBeGreaterThan(secondsWhenLeaving + AWAY_FOR_SECONDS);
      await gunsmith.room.joinAsAStranger(code);
    });

    then("the second player's match carries on while the first is away", async ({gunsmith}) => {
      expect(await gunsmith.room.secondBrowser().round.getState()).toBe("playing");
    });

    when("the first player returns", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.room.returnToTheRoom();
        await gunsmith.room.connection.waitForTheMatchAgain();
      });

      then(
        "they are in their own seat, where they were left and not where walking would have taken them",
        async ({gunsmith}) => {
          await expect
            .poll(async () => {
              const place = await gunsmith.player.getPosition();

              return Math.hypot(place.x - placeWhenLeaving.x, place.y - placeWhenLeaving.y);
            })
            .toBeLessThan(SAME_PLACE_WITHIN_TILES);
        },
      );

      then("the stranger was not given the seat", ({gunsmith}) => {
        // The first player's return is the positive evidence; the stranger, who opened the room before it, has been sent nothing.
        expect(gunsmith.room.strangersBrowser().room.frames.hasReceivedSnapshots()).toBe(false);
      });
    });
  });
});
