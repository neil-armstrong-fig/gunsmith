import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// Once everything is chosen the match does not begin at once: both players are shown the arena and the four weapons (what each carries), for
// up to 30 seconds or until both press Start the match. Every other online spec has no reveal (`?revealSeconds=0`), so a room here is made
// with real time for it.
const SECONDS_TO_REVEAL = 60;
const SECONDS_TO_REVEAL_QUICKLY = 4;

given("a private room whose players have chosen everything and are shown the reveal", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom({revealSeconds: SECONDS_TO_REVEAL, preRoundSeconds: 60});
    await gunsmith.room.joinWithASecondBrowserToChoose(code);
    const second = gunsmith.room.secondBrowser();

    await gunsmith.preRound.choose(1, "Submachine gun");
    for (const player of [gunsmith, second]) {
      await player.room.preRound.lockInWeapon(1);
    }
    await second.preRound.choose(2, "Rifle");
    for (const player of [gunsmith, second]) {
      await player.room.preRound.lockInWeapon(2);
      await player.room.preRound.lockInArena();
    }
    await gunsmith.room.preRound.waitForTheReveal();
    await second.room.preRound.waitForTheReveal();
  });

  then("each sees their own two weapons and the other's, from their own side", async ({gunsmith}) => {
    const second = gunsmith.room.secondBrowser();

    expect(await gunsmith.preRound.getReveal()).toEqual({
      yours: ["Submachine gun", "Marksman rifle"],
      opponent: ["Rifle", "Rifle"],
    });
    expect(await second.preRound.getReveal()).toEqual({
      yours: ["Rifle", "Rifle"],
      opponent: ["Submachine gun", "Marksman rifle"],
    });
  });

  then("both are shown the arena the match is played on", async ({gunsmith}) => {
    expect((await gunsmith.preRound.arena.getReveal()).name).toBe("Duel");
    expect((await gunsmith.room.secondBrowser().preRound.arena.getReveal()).name).toBe("Duel");
  });

  then("the match has not begun, and a clock counts down from the reveal's time", async ({gunsmith}) => {
    const secondsLeft = await gunsmith.room.preRound.getSecondsLeft();

    expect(gunsmith.room.hasReceivedSnapshots()).toBe(false);
    expect(secondsLeft).toBeLessThanOrEqual(SECONDS_TO_REVEAL);
    expect(secondsLeft).toBeGreaterThan(0);
  });

  then("the server sent each the reveal", async ({gunsmith}) => {
    expect(gunsmith.room.hasBeenToldTheReveal()).toBe(true);
    expect(gunsmith.room.secondBrowser().room.hasBeenToldTheReveal()).toBe(true);
  });

  when("the first player asks to start the match", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.room.preRound.askToStartTheMatch();
    });

    then("they are told they wait for the other player, and the match has not begun", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.room.preRound.isWaitingForTheOtherPlayerToStart()).toBe(true);
      expect(gunsmith.room.hasReceivedSnapshots()).toBe(false);
    });

    when("the second player asks to start the match too", () => {
      beforeEach(async ({gunsmith}) => {
        const second = gunsmith.room.secondBrowser();

        await second.room.preRound.askToStartTheMatch();
        await gunsmith.room.waitForTheMatch();
        await second.room.waitForTheMatch();
      });

      then("the reveal is gone from both screens and the match begins", async ({gunsmith}) => {
        expect(await gunsmith.room.preRound.isOpen()).toBe(false);
        expect(await gunsmith.room.secondBrowser().room.preRound.isOpen()).toBe(false);
      });

      then("each has the first weapon they chose in hand", async ({gunsmith}) => {
        const second = gunsmith.room.secondBrowser();

        await expect.poll(async () => (await gunsmith.hud.getInventory()).selectedName).toBe("Submachine gun");
        await expect.poll(async () => (await second.hud.getInventory()).selectedName).toBe("Rifle");
      });
    });
  });
});

given("a private room whose players have chosen everything and the reveal lasts four seconds", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom({revealSeconds: SECONDS_TO_REVEAL_QUICKLY, preRoundSeconds: 60});
    await gunsmith.room.joinWithASecondBrowserToChoose(code);

    for (const player of [gunsmith, gunsmith.room.secondBrowser()]) {
      await player.room.preRound.lockInWeapon(1);
      await player.room.preRound.lockInWeapon(2);
      await player.room.preRound.lockInArena();
    }
  });

  when("neither asks to start", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.room.waitForTheMatch();
      await gunsmith.room.secondBrowser().room.waitForTheMatch();
    });

    then("the match begins when the reveal's time is up", async ({gunsmith}) => {
      expect(await gunsmith.room.preRound.isOpen()).toBe(false);
      expect(await gunsmith.room.secondBrowser().room.preRound.isOpen()).toBe(false);
    });
  });
});

given("a private room in its reveal, whose first player loses their connection", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.room.prepareToLoseTheConnection();
    const code = await gunsmith.room.createPrivateRoom({revealSeconds: SECONDS_TO_REVEAL, preRoundSeconds: 60});
    await gunsmith.room.joinWithASecondBrowserToChoose(code);
    for (const player of [gunsmith, gunsmith.room.secondBrowser()]) {
      await player.room.preRound.lockInWeapon(1);
      await player.room.preRound.lockInWeapon(2);
      await player.room.preRound.lockInArena();
    }
    await gunsmith.room.preRound.waitForTheReveal();
  });

  when("the connection is cut and returns", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.room.cutTheConnection();
      await gunsmith.room.waitToBeSeatedAgain();
    });

    then("the first player is shown the reveal again", async ({gunsmith}) => {
      await gunsmith.room.preRound.waitForTheReveal();
      expect(await gunsmith.preRound.getReveal()).toEqual({
        yours: ["Rifle", "Marksman rifle"],
        opponent: ["Rifle", "Marksman rifle"],
      });
    });
  });
});
