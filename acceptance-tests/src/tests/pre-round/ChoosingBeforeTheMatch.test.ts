import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const FAST_PROMPT = "a fast little submachine gun";
const BUILT_IN_WEAPONS = ["Rifle", "Marksman rifle", "Submachine gun"];

// Against a player who stands still the opponent has won a round within 9.4 game seconds on every one of 40 seeds measured
// in the engine, so fifteen is the longest this spec waits for a round to be lost.
const LONGEST_LOSS_SECONDS = 15;

given("the practice range, with a weapon the player made and saved", () => {
  let madeName = "";

  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.open();
    await gunsmith.workshop.pasteThePrompt(FAST_PROMPT);
    await gunsmith.workshop.make();
    madeName = (await gunsmith.workshop.getResult()).name;
    await gunsmith.workshop.shelf.save();
    await gunsmith.workshop.close();
    await gunsmith.menu.pressSettings();
  });

  when("the player looks at the practice range", () => {
    then("Start bot game is offered", async ({gunsmith}) => {
      expect(await gunsmith.preRound.hasStartBotGame()).toBe(true);
    });
  });

  when("the player presses Start bot game", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.preRound.startBotGame();
    });

    then("the pre-round is open and the round has not begun", async ({gunsmith}) => {
      expect(await gunsmith.preRound.isOpen()).toBe(true);
      expect(await gunsmith.menu.isOpen()).toBe(false);
      expect(await gunsmith.round.getElapsedSeconds()).toBe(0);
    });

    then("each slot offers the built-in weapons and the saved one", async ({gunsmith}) => {
      expect(await gunsmith.preRound.getChoices(1)).toEqual([...BUILT_IN_WEAPONS, madeName]);
      expect(await gunsmith.preRound.getChoices(2)).toEqual([...BUILT_IN_WEAPONS, madeName]);
    });

    then("the rifle and the marksman rifle are chosen to begin with", async ({gunsmith}) => {
      expect(await gunsmith.preRound.getChosen(1)).toBe("Rifle");
      expect(await gunsmith.preRound.getChosen(2)).toBe("Marksman rifle");
    });

    when("the player chooses the saved weapon for weapon 1 and locks in", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.preRound.choose(1, madeName);
        await gunsmith.preRound.lockIn();
      });

      then("the reveal shows both fighters' weapons, and the round has not begun", async ({gunsmith}) => {
        expect(await gunsmith.preRound.getReveal()).toEqual({
          yours: [madeName, "Marksman rifle"],
          opponent: ["Rifle", "Marksman rifle"],
        });
        expect(await gunsmith.round.getElapsedSeconds()).toBe(0);
      });

      when("the player starts the match", () => {
        beforeEach(async ({gunsmith}) => {
          await gunsmith.preRound.startTheMatch();
        });

        then("the saved weapon is in hand, with a full magazine and reserve", async ({gunsmith}) => {
          const weapon = await gunsmith.weapon.get();

          expect((await gunsmith.hud.getInventory()).selectedName.toLowerCase()).toBe(madeName.toLowerCase());
          expect(weapon.rounds).toBeGreaterThan(0);
          expect(weapon.reserve).toBeGreaterThan(0);
        });

        when("the player switches to weapon 2", () => {
          beforeEach(async ({gunsmith}) => {
            await gunsmith.player.switchTo(2);
            await gunsmith.weapon.waitForSlot(2);
          });

          then("it is the marksman rifle", async ({gunsmith}) => {
            expect((await gunsmith.hud.getInventory()).selectedName.toLowerCase()).toBe("marksman rifle");
          });
        });

        then("the round is being fought", async ({gunsmith}) => {
          await gunsmith.round.waitForState("playing");
          expect(await gunsmith.round.getElapsedSeconds()).toBeGreaterThan(0);
        });

        when("the player loses the round and goes on to the next", () => {
          beforeEach(async ({gunsmith}) => {
            await gunsmith.round.waitForState("lost", LONGEST_LOSS_SECONDS);
            await gunsmith.round.nextRound();
            await gunsmith.round.waitForBannerToGo();
          });

          then("the saved weapon is in hand again", async ({gunsmith}) => {
            expect((await gunsmith.hud.getInventory()).selectedName.toLowerCase()).toBe(madeName.toLowerCase());
          });
        });
      });
    });

    when("the player locks in and starts without choosing", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.preRound.lockIn();
        await gunsmith.preRound.startTheMatch();
      });

      then("the rifle is in hand, as in a match today", async ({gunsmith}) => {
        expect((await gunsmith.hud.getInventory()).selectedName.toLowerCase()).toBe("rifle");
      });
    });
  });
});

given("a duel opened behind its pre-round, with nothing saved", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startDuelWithPreRound();
  });

  when("the player looks at the choices", () => {
    then("only the built-in weapons are offered", async ({gunsmith}) => {
      expect(await gunsmith.preRound.getChoices(1)).toEqual(BUILT_IN_WEAPONS);
    });
  });
});

given("a plain duel", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startDuel();
  });

  when("it has begun", () => {
    then("there is no pre-round: the fight is on", async ({gunsmith}) => {
      expect(await gunsmith.preRound.isOpen()).toBe(false);
    });
  });
});
