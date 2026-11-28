import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The server plays the match and scores it (`docs/match-netcode.md`); each browser is told the score from its own side, and a new
// round begins only when both players have asked for it. The first player shoots the second, who stands still: the rifle needs a
// few seconds to take a full health bar, so this is the longest a round is waited for.
const LONGEST_KILL_SECONDS = 30;

given("two browsers are in one private room", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom();

    await gunsmith.room.joinWithASecondBrowser(code);
  });

  when("the first player shoots the second until the round is decided", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(await gunsmith.room.secondBrowser().player.getPosition());

      await gunsmith.player.startFiring();
      await gunsmith.round.waitForState("won", LONGEST_KILL_SECONDS);
      await gunsmith.player.stopFiring();
    });

    then("the first browser is told it won, with the score from its side", async ({gunsmith}) => {
      expect(await gunsmith.round.getBannerMessage()).toBe("You won");
      expect(await gunsmith.round.getBannerScore()).toBe("You 1 · Opponent 0");
    });

    then("the second browser is told it lost, with the score from its side", async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      await second.round.waitForState("lost");

      expect(await second.round.getBannerMessage()).toBe("You lost");
      expect(await second.round.getBannerScore()).toBe("You 0 · Opponent 1");
    });

    then("both browsers are offered the next round, not a new match", async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();
      await gunsmith.round.getBannerMessage();
      await second.round.getBannerMessage();

      expect(await gunsmith.round.isNextRoundOffered()).toBe(true);
      expect(await second.round.isNextRoundOffered()).toBe(true);
      expect(await gunsmith.round.isPlayAgainOffered()).toBe(false);
    });

    when("only the first player asks for the next round", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.round.getBannerMessage();
        await gunsmith.room.secondBrowser().round.getBannerMessage();
        await gunsmith.round.nextRound();
      });

      then("the first player is told it is waiting for the other", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.round.isWaitingForTheOtherPlayer()).toBe(true);
      });

      then("the round is not begun for either of them", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.round.isWaitingForTheOtherPlayer()).toBe(true);

        expect(await gunsmith.round.getState()).toBe("won");
        expect(await gunsmith.room.secondBrowser().round.getState()).toBe("lost");
        expect(await gunsmith.room.secondBrowser().round.isNextRoundOffered()).toBe(true);
      });
    });

    when("both players ask for the next round", () => {
      beforeEach(async ({gunsmith}) => {
        const second = gunsmith.room.secondBrowser();

        await gunsmith.round.getBannerMessage();
        await second.round.getBannerMessage();

        await gunsmith.round.nextRound();
        await second.round.nextRound();

        await gunsmith.round.waitForBannerToGo();
        await second.round.waitForBannerToGo();
      });

      then("the second round is being fought in both browsers, with the score kept", async ({gunsmith}) => {
        const second = gunsmith.room.secondBrowser();

        expect(await gunsmith.round.getState()).toBe("playing");
        expect(await second.round.getState()).toBe("playing");
        expect(await gunsmith.match.getScore()).toEqual({playerWins: 1, opponentWins: 0, round: 2});
        expect(await second.match.getScore()).toEqual({playerWins: 0, opponentWins: 1, round: 2});
      });

      then("both fighters have their health back", async ({gunsmith}) => {
        const second = gunsmith.room.secondBrowser();

        // The second fighter died in the round before; the first never fired at, so its health is the full one to compare with.
        const fullHealth = await gunsmith.player.getHealth();

        expect(fullHealth).toBeGreaterThan(0);
        await expect.poll(() => second.player.getHealth()).toBe(fullHealth);
      });
    });
  });
});
