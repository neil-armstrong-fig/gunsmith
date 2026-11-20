import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const DUEL = {name: "Duel", size: {width: 20, height: 12}};
const FAIR_DUEL = {name: "Fair duel", size: {width: 21, height: 13}};

// Against a player who stands still the opponent has won a round within 9.4 game seconds on every one of 40 seeds measured
// in the engine, so fifteen is the longest this spec waits for a round to be lost.
const LONGEST_LOSS_SECONDS = 15;

given("the pre-round is open", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startDuelWithPreRound();
  });

  when("the player looks at the choosing", () => {
    then("the arena choices are the built-in arenas", async ({gunsmith}) => {
      expect(await gunsmith.preRound.arena.getChoices()).toEqual([DUEL.name, FAIR_DUEL.name]);
    });

    then("the Duel is chosen to begin with, and a preview of it is shown", async ({gunsmith}) => {
      expect(await gunsmith.preRound.arena.getChosen()).toBe(DUEL.name);
      expect(await gunsmith.preRound.arena.getPreviewName()).toBe(DUEL.name);
    });

    when("the player chooses the Fair duel", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.preRound.arena.choose(FAIR_DUEL.name);
      });

      then("the preview follows the choice", async ({gunsmith}) => {
        expect(await gunsmith.preRound.arena.getPreviewName()).toBe(FAIR_DUEL.name);
      });
    });
  });

  when("the player chooses the Fair duel and locks in", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.preRound.arena.choose(FAIR_DUEL.name);
      await gunsmith.preRound.lockIn();
    });

    then("the reveal shows the Fair duel, with the round not begun", async ({gunsmith}) => {
      expect(await gunsmith.preRound.arena.getReveal()).toEqual({name: FAIR_DUEL.name});
      expect(await gunsmith.round.getElapsedSeconds()).toBe(0);
    });

    when("the player starts the match", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.preRound.startTheMatch();
      });

      then("the match is played on the Fair duel", async ({gunsmith}) => {
        expect(await gunsmith.arena.getSizeInTiles()).toEqual(FAIR_DUEL.size);
      });

      when("the player loses the first round standing still and goes on", () => {
        beforeEach(async ({gunsmith}) => {
          await gunsmith.round.waitForState("lost", LONGEST_LOSS_SECONDS);
          await gunsmith.round.nextRound();
          await gunsmith.round.waitForBannerToGo();
        });

        then("round 2 is played on the same arena", async ({gunsmith}) => {
          expect(await gunsmith.arena.getSizeInTiles()).toEqual(FAIR_DUEL.size);
        });
      });
    });
  });

  when("the player keeps the Duel, locks in and starts the match", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.preRound.lockIn();
      await gunsmith.preRound.startTheMatch();
    });

    then("the match is played on the Duel", async ({gunsmith}) => {
      expect(await gunsmith.arena.getSizeInTiles()).toEqual(DUEL.size);
    });
  });
});

given("the player has saved an arena the workshop made", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.open();
    await gunsmith.workshop.arenas.open();
    await gunsmith.workshop.pasteThePrompt("a yard with one pillar");
    await gunsmith.workshop.make();
    await gunsmith.workshop.arenas.pressArenaAction("Save");
    await gunsmith.startDuelWithPreRound();
  });

  when("the player looks at the arena choices", () => {
    then("the built-ins come first and then the saved arena", async ({gunsmith}) => {
      const choices = await gunsmith.preRound.arena.getChoices();

      expect(choices.slice(0, 2)).toEqual([DUEL.name, FAIR_DUEL.name]);
      expect(choices).toHaveLength(3);
    });
  });

  when("the player chooses the saved arena, locks in and starts the match", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.preRound.arena.choose((await gunsmith.preRound.arena.getChoices())[2] ?? "");
      await gunsmith.preRound.lockIn();
      await gunsmith.preRound.startTheMatch();
    });

    then("the match is not on either built-in arena, and the round is on", async ({gunsmith}) => {
      const size = await gunsmith.arena.getSizeInTiles();

      expect(size).not.toEqual(DUEL.size);
      expect(size).not.toEqual(FAIR_DUEL.size);
      await gunsmith.round.waitForState("playing");
    });
  });

  when("the player locks in the saved arena, and opens the pre-round again", () => {
    let savedName = "";

    beforeEach(async ({gunsmith}) => {
      savedName = (await gunsmith.preRound.arena.getChoices())[2] ?? "";
      await gunsmith.preRound.arena.choose(savedName);
      await gunsmith.preRound.lockIn();
      await gunsmith.startDuelWithPreRound();
    });

    then("the saved arena is chosen again", async ({gunsmith}) => {
      expect(await gunsmith.preRound.arena.getChosen()).toBe(savedName);
    });
  });
});

given("the player locked in a weapon in each slot and an arena, and opens the pre-round again", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startDuelWithPreRound();
    await gunsmith.preRound.choose(1, "Submachine gun");
    await gunsmith.preRound.choose(2, "Rifle");
    await gunsmith.preRound.arena.choose(FAIR_DUEL.name);
    await gunsmith.preRound.lockIn();
    await gunsmith.preRound.startTheMatch();
    await gunsmith.startDuelWithPreRound();
  });

  when("the choosing comes up", () => {
    then("each weapon is chosen again", async ({gunsmith}) => {
      expect(await gunsmith.preRound.getChosen(1)).toBe("Submachine gun");
      expect(await gunsmith.preRound.getChosen(2)).toBe("Rifle");
    });

    then("the arena is chosen again, with its preview", async ({gunsmith}) => {
      expect(await gunsmith.preRound.arena.getChosen()).toBe(FAIR_DUEL.name);
      expect(await gunsmith.preRound.arena.getPreviewName()).toBe(FAIR_DUEL.name);
    });
  });
});

given("the player chose a weapon and an arena but never locked in, and opens the pre-round again", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startDuelWithPreRound();
    await gunsmith.preRound.choose(1, "Submachine gun");
    await gunsmith.preRound.arena.choose(FAIR_DUEL.name);
    await gunsmith.startDuelWithPreRound();
  });

  when("the choosing comes up", () => {
    then("it begins on the defaults, as nothing was locked in", async ({gunsmith}) => {
      expect(await gunsmith.preRound.getChosen(1)).toBe("Rifle");
      expect(await gunsmith.preRound.arena.getChosen()).toBe(DUEL.name);
    });
  });
});
