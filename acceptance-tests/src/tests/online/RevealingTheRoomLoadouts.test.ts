import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// Once everything is chosen the match does not begin at once: both players are shown the arena and the four weapons (what each carries), for
// up to 30 seconds or until both press Start the match. Every other online spec has no reveal (`?revealSeconds=0`), so a room here is made
// with real time for it.
const SECONDS_TO_REVEAL = 60;
const SECONDS_TO_REVEAL_QUICKLY = 4;
const STAT_LABELS = ["Damage", "Shots a second", "Magazine", "Reserve", "Reload", "Vision"];

given("a private room whose players have chosen everything and are shown the reveal", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom({revealSeconds: SECONDS_TO_REVEAL, preRoundSeconds: 60});
    await gunsmith.room.joinWithASecondBrowserToChoose(code);
    const second = gunsmith.room.secondBrowser();

    await gunsmith.preRound.choose(1, "Submachine gun");
    await gunsmith.room.preRound.lockInWeapon(1);
    await second.room.preRound.lockInWeapon(1);

    await second.preRound.choose(2, "Rifle");
    await gunsmith.room.preRound.lockInWeapon(2);
    await gunsmith.room.preRound.lockInArena();
    await second.room.preRound.lockInWeapon(2);
    await second.room.preRound.lockInArena();

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

  then(
    "each sees every weapon's power rating and stats, and the other's numbers as the other sees their own",
    async ({gunsmith}) => {
      const first = await gunsmith.preRound.getRevealNumbers();
      const second = await gunsmith.room.secondBrowser().preRound.getRevealNumbers();

      expect(first.opponent).toEqual(second.yours);
      expect(second.opponent).toEqual(first.yours);
      const weapons = [...first.yours, ...first.opponent];
      const ratings = weapons.map(weapon => weapon.rating);

      expect(weapons.map(weapon => Object.keys(weapon.stats))).toEqual([
        STAT_LABELS,
        STAT_LABELS,
        STAT_LABELS,
        STAT_LABELS,
      ]);
      expect(Math.min(...ratings)).toBeGreaterThanOrEqual(0);
      expect(Math.max(...ratings)).toBeLessThanOrEqual(100);
    },
  );

  then("weapons that differ show different numbers", async ({gunsmith}) => {
    const {yours, opponent} = await gunsmith.preRound.getRevealNumbers();

    expect(yours[0]?.stats).not.toEqual(yours[1]?.stats);
    expect(yours[0]?.stats).not.toEqual(opponent[0]?.stats);
  });

  then("both are shown the arena the match is played on", async ({gunsmith}) => {
    expect((await gunsmith.preRound.arena.getReveal()).name).toBe("Duel");
    expect((await gunsmith.room.secondBrowser().preRound.arena.getReveal()).name).toBe("Duel");
  });

  then("the match has not begun, and a clock counts down from the reveal's time", async ({gunsmith}) => {
    const secondsLeft = await gunsmith.room.preRound.getSecondsLeft();

    expect(gunsmith.room.frames.hasReceivedSnapshots()).toBe(false);
    expect(secondsLeft).toBeLessThanOrEqual(SECONDS_TO_REVEAL);
    expect(secondsLeft).toBeGreaterThan(0);
  });

  then("the server sent each the reveal", async ({gunsmith}) => {
    expect(gunsmith.room.frames.hasBeenToldTheReveal()).toBe(true);
    expect(gunsmith.room.secondBrowser().room.frames.hasBeenToldTheReveal()).toBe(true);
  });

  when("the first player asks to start the match", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.room.preRound.askToStartTheMatch();
    });

    then("they are told they wait for the other player, and the match has not begun", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.room.preRound.isWaitingForTheOtherPlayerToStart()).toBe(true);
      expect(gunsmith.room.frames.hasReceivedSnapshots()).toBe(false);
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
    const second = gunsmith.room.secondBrowser();

    await gunsmith.room.preRound.lockInWeapon(1);
    await gunsmith.room.preRound.lockInWeapon(2);
    await gunsmith.room.preRound.lockInArena();

    await second.room.preRound.lockInWeapon(1);
    await second.room.preRound.lockInWeapon(2);
    await second.room.preRound.lockInArena();
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
    await gunsmith.room.connection.prepareToLoseTheConnection();
    const code = await gunsmith.room.createPrivateRoom({revealSeconds: SECONDS_TO_REVEAL, preRoundSeconds: 60});
    await gunsmith.room.joinWithASecondBrowserToChoose(code);
    const second = gunsmith.room.secondBrowser();

    await gunsmith.room.preRound.lockInWeapon(1);
    await gunsmith.room.preRound.lockInWeapon(2);
    await gunsmith.room.preRound.lockInArena();

    await second.room.preRound.lockInWeapon(1);
    await second.room.preRound.lockInWeapon(2);
    await second.room.preRound.lockInArena();

    await gunsmith.room.preRound.waitForTheReveal();
  });

  when("the connection is cut and returns", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.room.connection.cutTheConnection();
      await gunsmith.room.connection.waitToBeSeatedAgain();
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
