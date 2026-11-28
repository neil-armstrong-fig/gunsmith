import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The mutual knockout: the duel's first round with one shot in the air from each fighter at the other, each landing in the first
// step and each enough to bring its target down. The opponent stands unarmed, so nothing but those two shots can end the round, and
// both fall together: the round is drawn and nobody scores (the user's rule, 2026-11-19).
const LONGEST_DRAW_SECONDS = 5;

given("both fighters are hit by a shot that brings them down in the same step", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startMutualKnockout();
  });

  when("the round is over", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.round.waitForState("drawn", LONGEST_DRAW_SECONDS);
    });

    then("both fighters are down", async ({gunsmith}) => {
      expect(await gunsmith.player.getHealth()).toBe(0);
      expect((await gunsmith.opponent.get()).health).toBe(0);
    });

    then("nobody has a round, and the match is still in its first round", async ({gunsmith}) => {
      expect(await gunsmith.match.getScore()).toEqual({playerWins: 0, opponentWins: 0, round: 1});
    });

    then("the banner says the round was a draw, and shows the score", async ({gunsmith}) => {
      expect(await gunsmith.round.getBannerMessage()).toBe("Draw");
      expect(await gunsmith.round.getBannerScore()).toBe("You 0 · Opponent 0");
    });

    then("the next round is offered, not a new match", async ({gunsmith}) => {
      await gunsmith.round.getBannerMessage();

      expect(await gunsmith.round.isNextRoundOffered()).toBe(true);
      expect(await gunsmith.round.isPlayAgainOffered()).toBe(false);
    });
  });

  when("the player goes on to the next round", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.round.waitForState("drawn", LONGEST_DRAW_SECONDS);
      await gunsmith.round.nextRound();
      await gunsmith.round.waitForBannerToGo();
    });

    then("the second round is being fought, with the score still at nothing to nothing", async ({gunsmith}) => {
      expect(await gunsmith.round.getState()).toBe("playing");
      expect(await gunsmith.match.getScore()).toEqual({playerWins: 0, opponentWins: 0, round: 2});
      expect(await gunsmith.match.getScoreOnScreen()).toBe("Round 2 · You 0 · Opponent 0");
    });
  });
});
