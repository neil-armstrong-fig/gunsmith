import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A room does not wait for ever (`docs/match-netcode.md`, "Reconnect and forfeits"): a player who has left has 30 seconds to come back, and a
// player who is there but asks for nothing new for about 60 seconds is idle; either way the round is forfeited to the other player, and two
// forfeits lose the match. The real limits are far too long to wait for, so each room here is made with short ones. The other player, who is
// plainly there, keeps moving so that they are never the one who has gone quiet.
const FORFEIT_WITHIN_SECONDS = 15;
const KEEP_MOVING_SECONDS = 6;

given("two browsers are in a private room that waits two seconds for a player to come back", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom({reconnectSeconds: 2});

    await gunsmith.room.joinWithASecondBrowser(code);
  });

  when("the first player leaves and does not come back in time", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.room.leaveTheRoom();
      await gunsmith.room.secondBrowser().round.waitForState("won", FORFEIT_WITHIN_SECONDS);
    });

    then("the second player has won the round, with the score from their side", async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      expect(await second.round.getBannerMessage()).toBe("You won");
      expect(await second.match.getScore()).toEqual({playerWins: 1, opponentWins: 0, round: 1});
    });

    when("the first player comes back", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.room.returnToTheRoom();
        await gunsmith.room.waitForTheMatchAgain();
      });

      then("they are told they lost the round, with the score from their side", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.round.getState()).toBe("lost");

        expect(await gunsmith.match.getScore()).toEqual({playerWins: 0, opponentWins: 1, round: 1});
      });
    });
  });
});

// A player who is idle and never asks for the next round forfeits that too, a second idle time later: the second player is watched at a time
// between the two, so this room waits four seconds and the watching lasts six.
given("two browsers are in a private room that waits four seconds for a player to ask for something", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom({idleSeconds: 4});

    await gunsmith.room.joinWithASecondBrowser(code);
  });

  when("the first player stays but asks for nothing new while the second keeps moving", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.room.secondBrowser().room.keepMovingFor(KEEP_MOVING_SECONDS);
    });

    then("the second player has won the round", async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      expect(await second.round.getState()).toBe("won");
      expect(await second.match.getScore()).toEqual({playerWins: 1, opponentWins: 0, round: 1});
    });

    then("the first player is told they lost it, though they never left", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.round.getState()).toBe("lost");

      expect(await gunsmith.match.getScore()).toEqual({playerWins: 0, opponentWins: 1, round: 1});
    });
  });

  when(
    "the first player never asks for anything, and the second asks for the next round after winning the first",
    () => {
      beforeEach(async ({gunsmith}) => {
        const second = gunsmith.room.secondBrowser();

        await second.room.keepMovingFor(KEEP_MOVING_SECONDS);
        await second.round.getBannerMessage();
        await second.round.nextRound();
        await second.room.keepMovingFor(KEEP_MOVING_SECONDS);
      });

      then("the first player forfeits the next round too, and the second has won the match", async ({gunsmith}) => {
        const second = gunsmith.room.secondBrowser();

        expect(await second.match.getScore()).toEqual({playerWins: 2, opponentWins: 0, round: 2});
        await expect.poll(() => second.round.isPlayAgainOffered()).toBe(true);
      });
    },
  );
});
