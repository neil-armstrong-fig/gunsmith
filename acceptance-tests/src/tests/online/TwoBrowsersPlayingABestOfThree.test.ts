import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A best of three decided in the first player's favour, in two rounds: the server scores each round and, once the match is decided, offers
// only a new match, which begins when both players ask for it. A round shot to its end takes about ten seconds, as in
// `TwoBrowsersPlayingARound`, so each criterion here runs about fifteen seconds of the thirty it is allowed.
const LONGEST_KILL_SECONDS = 30;

given("two browsers are in one private room", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom();

    await gunsmith.room.joinWithASecondBrowser(code);
  });

  when("the first player wins two rounds", () => {
    beforeEach(async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      await gunsmith.player.aimAtTile(await second.player.getPosition());
      await gunsmith.player.startFiring();
      await gunsmith.round.waitForState("won", LONGEST_KILL_SECONDS);
      await gunsmith.player.stopFiring();
      await gunsmith.round.nextRound();
      await second.round.nextRound();
      await gunsmith.round.waitForBannerToGo();
      await second.round.waitForBannerToGo();

      await gunsmith.player.aimAtTile(await second.player.getPosition());
      await gunsmith.player.startFiring();
      await gunsmith.round.waitForState("won", LONGEST_KILL_SECONDS);
      await gunsmith.player.stopFiring();
    });

    then("each browser is told who won the match, with the score from its side", async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      expect(await gunsmith.round.getBannerMessage()).toBe("You won the match");
      expect(await gunsmith.round.getBannerScore()).toBe("You 2 · Opponent 0");
      expect(await second.round.getBannerMessage()).toBe("You lost the match");
      expect(await second.round.getBannerScore()).toBe("You 0 · Opponent 2");
    });

    then("only a new match is offered to both", async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();
      await gunsmith.round.getBannerMessage();
      await second.round.getBannerMessage();

      expect(await gunsmith.round.isPlayAgainOffered()).toBe(true);
      expect(await second.round.isPlayAgainOffered()).toBe(true);
      expect(await gunsmith.round.isNextRoundOffered()).toBe(false);
      expect(await second.round.isNextRoundOffered()).toBe(false);
    });

    when("both players ask to play again", () => {
      beforeEach(async ({gunsmith}) => {
        const second = gunsmith.room.secondBrowser();
        await gunsmith.round.getBannerMessage();
        await second.round.getBannerMessage();
        await gunsmith.round.playAgain();
        await second.round.playAgain();
        await gunsmith.round.waitForBannerToGo();
        await second.round.waitForBannerToGo();
      });

      then("a fresh match begins in both browsers, at nothing to nothing in its first round", async ({gunsmith}) => {
        const second = gunsmith.room.secondBrowser();

        expect(await gunsmith.round.getState()).toBe("playing");
        expect(await gunsmith.match.getScore()).toEqual({playerWins: 0, opponentWins: 0, round: 1});
        expect(await second.match.getScore()).toEqual({playerWins: 0, opponentWins: 0, round: 1});
      });
    });
  });
});
