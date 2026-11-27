import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// After the weapons the two players put forward an arena each. A player sees the other's only once both have locked in theirs. The same arena
// is simply played; two different ones are both shown to both, and each picks one, random, or nothing: the engine's rule settles it and the
// screen says how. Weapons are locked in with the defaults first, so these specs are about the arena alone. The room offers every built-in
// arena, not the day's five (`addressOfRoom`'s default), so the Duel and the Fair duel are always there to choose.
const SECONDS_TO_CHOOSE = 60;
const DUEL_SIZE = {width: 20, height: 12};
const FAIR_DUEL_SIZE = {width: 21, height: 13};

given("a private room whose two players have locked in their weapons", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom({preRoundSeconds: SECONDS_TO_CHOOSE});
    await gunsmith.room.joinWithASecondBrowserToChoose(code);
    for (const player of [gunsmith, gunsmith.room.secondBrowser()]) {
      await player.room.preRound.lockInWeapon(1);
      await player.room.preRound.lockInWeapon(2);
    }
  });

  then(
    "each is offered the built-in arenas the room offers, the Duel to begin with, with a preview of the one chosen",
    async ({gunsmith}) => {
      expect(await gunsmith.preRound.arena.getChoices()).toEqual(gunsmith.room.getArenasOffered());
      expect(await gunsmith.preRound.arena.getChosen()).toBe("Duel");
      expect(await gunsmith.preRound.arena.getPreviewName()).toBe("Duel");
    },
  );

  when("the first player locks in the Fair duel and the second has not locked in", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.preRound.arena.choose("Fair duel");
      await gunsmith.room.preRound.lockInArena();
    });

    then("the second player is not shown it, on the screen or by the server", async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      await expect.poll(() => second.room.hasReceivedPreRounds()).toBe(true);
      expect(second.room.hasBeenToldTheOpponentsArena()).toBe(false);
      expect(await second.room.preRound.getOpponentArena()).toBeUndefined();
      expect(await gunsmith.room.preRound.getOpponentArena()).toBeUndefined();
    });

    when("the second player locks in the Duel", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.room.secondBrowser().room.preRound.lockInArena();
      });

      then("each is shown the other's arena and offered the pick between the two", async ({gunsmith}) => {
        const second = gunsmith.room.secondBrowser();

        expect(await gunsmith.room.preRound.waitForTheOpponentArena()).toBe("Duel");
        expect(await second.room.preRound.waitForTheOpponentArena()).toBe("Fair duel");
        await gunsmith.room.preRound.waitForTheArenaPick();
        await second.room.preRound.waitForTheArenaPick();
      });

      when("the first player picks the second player's arena and the second picks nothing", () => {
        beforeEach(async ({gunsmith}) => {
          const second = gunsmith.room.secondBrowser();

          await gunsmith.room.preRound.waitForTheArenaPick();
          await gunsmith.room.preRound.pickArena("theirs");
          await second.room.preRound.waitForTheArenaPick();
          await second.room.preRound.pickArena("nothing");
          await gunsmith.room.waitForTheMatch();
          await second.room.waitForTheMatch();
        });

        then(
          "the match is played on the Duel, the arena the first player picked, in both browsers",
          async ({gunsmith}) => {
            expect(await gunsmith.arena.getSizeInTiles()).toEqual(DUEL_SIZE);
            expect(await gunsmith.room.secondBrowser().arena.getSizeInTiles()).toEqual(DUEL_SIZE);
          },
        );
      });

      when("the first player picks their own arena and the second picks nothing", () => {
        beforeEach(async ({gunsmith}) => {
          const second = gunsmith.room.secondBrowser();

          await gunsmith.room.preRound.waitForTheArenaPick();
          await gunsmith.room.preRound.pickArena("mine");
          await second.room.preRound.waitForTheArenaPick();
          await second.room.preRound.pickArena("nothing");
          await gunsmith.room.waitForTheMatch();
          await second.room.waitForTheMatch();
        });

        then("the match is played on the Fair duel in both browsers", async ({gunsmith}) => {
          expect(await gunsmith.arena.getSizeInTiles()).toEqual(FAIR_DUEL_SIZE);
          expect(await gunsmith.room.secondBrowser().arena.getSizeInTiles()).toEqual(FAIR_DUEL_SIZE);
        });
      });

      when("the first player has picked and the second has not", () => {
        beforeEach(async ({gunsmith}) => {
          await gunsmith.room.preRound.waitForTheArenaPick();
          await gunsmith.room.preRound.pickArena("mine");
        });

        then("the match has not begun: it waits for the other pick", async ({gunsmith}) => {
          expect(await gunsmith.room.preRound.hasArenaPick()).toBe(true);
          expect(gunsmith.room.hasReceivedSnapshots()).toBe(false);
        });
      });
    });
  });

  when("both lock in the Fair duel", () => {
    beforeEach(async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      await gunsmith.preRound.arena.choose("Fair duel");
      await gunsmith.room.preRound.lockInArena();
      await second.preRound.arena.choose("Fair duel");
      await second.room.preRound.lockInArena();
      await gunsmith.room.waitForTheMatch();
      await second.room.waitForTheMatch();
    });

    then("there is nothing to pick: the match is played on the Fair duel in both browsers", async ({gunsmith}) => {
      expect(await gunsmith.arena.getSizeInTiles()).toEqual(FAIR_DUEL_SIZE);
      expect(await gunsmith.room.secondBrowser().arena.getSizeInTiles()).toEqual(FAIR_DUEL_SIZE);
      expect(await gunsmith.room.preRound.isOpen()).toBe(false);
    });
  });

  when("the two players put forward different arenas and both pick random", () => {
    beforeEach(async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      await gunsmith.preRound.arena.choose("Fair duel");
      await gunsmith.room.preRound.lockInArena();
      await second.room.preRound.lockInArena();
      await gunsmith.room.preRound.waitForTheArenaPick();
      await gunsmith.room.preRound.pickArena("random");
      await second.room.preRound.waitForTheArenaPick();
      await second.room.preRound.pickArena("random");
      await gunsmith.room.waitForTheMatch();
      await second.room.waitForTheMatch();
    });

    then("both are on the same one of the two arenas", async ({gunsmith}) => {
      const first = await gunsmith.arena.getSizeInTiles();
      const second = await gunsmith.room.secondBrowser().arena.getSizeInTiles();

      expect(second).toEqual(first);
      expect([DUEL_SIZE, FAIR_DUEL_SIZE]).toContainEqual(first);
    });
  });
});
