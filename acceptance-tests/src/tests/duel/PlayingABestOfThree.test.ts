import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// Against a player who stands still the opponent has won a round within 9.4 game seconds on every one of 40 seeds measured
// in the engine, so fifteen is the longest this spec waits for a round to be lost.
const LONGEST_LOSS_SECONDS = 15;

given("a duel has just begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startDuel();
  });

  when("the player has done nothing yet", () => {
    then("the match is at nothing to nothing, in its first round", async ({gunsmith}) => {
      expect(await gunsmith.match.getScore()).toEqual({playerWins: 0, opponentWins: 0, round: 1});
    });

    then("the screen shows the score and the round", async ({gunsmith}) => {
      expect(await gunsmith.match.getScoreOnScreen()).toBe("Round 1 · You 0 · Opponent 0");
    });
  });

  when("the player stands still and loses the first round", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.round.waitForState("lost", LONGEST_LOSS_SECONDS);
    });

    then("the opponent has a round, and the match goes on", async ({gunsmith}) => {
      expect(await gunsmith.match.getScore()).toEqual({playerWins: 0, opponentWins: 1, round: 1});
    });

    then("the banner says the round was lost, and shows the score", async ({gunsmith}) => {
      expect(await gunsmith.round.getBannerMessage()).toBe("You lost");
      expect(await gunsmith.round.getBannerScore()).toBe("You 0 · Opponent 1");
    });

    then("the next round is offered, not a new match", async ({gunsmith}) => {
      await gunsmith.round.getBannerMessage();

      expect(await gunsmith.round.isNextRoundOffered()).toBe(true);
      expect(await gunsmith.round.isPlayAgainOffered()).toBe(false);
    });
  });

  when("the player has fired and lost the first round, then goes on to the next", () => {
    let fullHealth = 0;
    let fullMagazine = 0;
    let opponentHealthAtStart = 0;
    let playerHealthWhenLost = 0;
    let opponentRoundsWhenLost = 0;

    beforeEach(async ({gunsmith}) => {
      fullHealth = await gunsmith.player.getHealth();
      fullMagazine = (await gunsmith.weapon.get()).rounds;
      opponentHealthAtStart = (await gunsmith.opponent.get()).health;

      // The opponent stands to the east, so the player aims at the west wall and the shots only spend rounds.
      await gunsmith.player.aimAtTile({x: 1.5, y: 6.5});
      await gunsmith.player.startFiring();
      await gunsmith.weapon.waitForRounds(fullMagazine - 1);
      await gunsmith.round.waitForState("lost", LONGEST_LOSS_SECONDS);
      await gunsmith.player.stopFiring();

      // A round that is over is frozen, so what the fighters had when it ended is exact. The next round is live, and the
      // opponent may already have fired when it is read, so "restored" is measured against this, not against "full".
      playerHealthWhenLost = await gunsmith.player.getHealth();
      opponentRoundsWhenLost = (await gunsmith.opponent.get()).rounds;

      await gunsmith.round.nextRound();
      await gunsmith.round.waitForBannerToGo();
    });

    then("the second round is being fought, with the score kept", async ({gunsmith}) => {
      expect(await gunsmith.round.getState()).toBe("playing");
      expect(await gunsmith.match.getScore()).toEqual({playerWins: 0, opponentWins: 1, round: 2});
      expect(await gunsmith.match.getScoreOnScreen()).toBe("Round 2 · You 0 · Opponent 1");
    });

    then("the player has their health back and a full magazine again", async ({gunsmith}) => {
      const health = await gunsmith.player.getHealth();

      expect(health).toBeGreaterThan(playerHealthWhenLost);
      expect(health).toBeLessThanOrEqual(fullHealth);
      expect((await gunsmith.weapon.get()).rounds).toBe(fullMagazine);
    });

    then("the opponent has its rounds back, with its health untouched", async ({gunsmith}) => {
      const opponent = await gunsmith.opponent.get();

      expect(opponent.health).toBe(opponentHealthAtStart);
      expect(opponent.rounds).toBeGreaterThan(opponentRoundsWhenLost);
      expect(opponent.rounds).toBeLessThanOrEqual(fullMagazine);
    });
  });

  when("the player stands still and loses two rounds", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.round.waitForState("lost", LONGEST_LOSS_SECONDS);
      await gunsmith.round.nextRound();
      await gunsmith.round.waitForBannerToGo();
      await gunsmith.round.waitForState("lost", LONGEST_LOSS_SECONDS);
    });

    then("the opponent has won the match", async ({gunsmith}) => {
      expect(await gunsmith.match.getScore()).toEqual({playerWins: 0, opponentWins: 2, round: 2});
    });

    then("the banner says the match was lost, and shows the score", async ({gunsmith}) => {
      expect(await gunsmith.round.getBannerMessage()).toBe("You lost the match");
      expect(await gunsmith.round.getBannerScore()).toBe("You 0 · Opponent 2");
    });

    then("only a new match is offered", async ({gunsmith}) => {
      await gunsmith.round.getBannerMessage();

      expect(await gunsmith.round.isPlayAgainOffered()).toBe(true);
      expect(await gunsmith.round.isNextRoundOffered()).toBe(false);
    });
  });

  when("the player loses the match and plays again", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.round.waitForState("lost", LONGEST_LOSS_SECONDS);
      await gunsmith.round.nextRound();
      await gunsmith.round.waitForBannerToGo();
      await gunsmith.round.waitForState("lost", LONGEST_LOSS_SECONDS);
      await gunsmith.round.playAgain();
      await gunsmith.round.waitForBannerToGo();
    });

    then("a fresh match begins, at nothing to nothing in its first round", async ({gunsmith}) => {
      expect(await gunsmith.round.getState()).toBe("playing");
      expect(await gunsmith.match.getScore()).toEqual({playerWins: 0, opponentWins: 0, round: 1});
      expect(await gunsmith.match.getScoreOnScreen()).toBe("Round 1 · You 0 · Opponent 0");
    });
  });
});
