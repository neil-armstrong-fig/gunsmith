import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The first thing that happens in a private room is the choosing, and it goes one weapon at a time (docs/game-design.md, "Pre-round"): a player
// locks in their first weapon, and only then is the other player's first weapon shown to them; their second weapon opens after that, so it can
// answer what they have seen; then the arena. The room hides all of this from every other online spec (`?preRoundSeconds=0`), so a room here is
// made with real time to choose. What the other player chose is theirs until both have locked in that slot: the browser is not sent it before
// then, which is read from the frames it was sent, never from the screen alone.
const BUILT_IN_WEAPONS = ["Rifle", "Marksman rifle", "Submachine gun"];
const SECONDS_TO_CHOOSE = 60;
const SECONDS_TO_CHOOSE_QUICKLY = 8;
/** How long a browser waits for the match after the clock, in milliseconds: the clock itself is longer than a poll's usual wait. */
const MATCH_AFTER_THE_CLOCK_MS = 20_000;

given("a private room whose players have a minute to choose", () => {
  let code = "";

  beforeEach(async ({gunsmith}) => {
    code = await gunsmith.room.createPrivateRoom({preRoundSeconds: SECONDS_TO_CHOOSE});
    await gunsmith.room.preRound.waitToBeChoosing();
  });

  then("the first player waits for the other, with the friend code to give them, and no clock", async ({gunsmith}) => {
    expect(await gunsmith.room.preRound.isWaitingForTheOtherPlayerToSit()).toBe(true);
    expect(await gunsmith.room.preRound.getFriendCode()).toBe(code);
    expect(await gunsmith.room.preRound.getSecondsLeft()).toBeUndefined();
  });

  then("they choose their first weapon among the built-ins, the rifle to begin with", async ({gunsmith}) => {
    expect(await gunsmith.preRound.getChoices(1)).toEqual(BUILT_IN_WEAPONS);
    expect(await gunsmith.preRound.getChosen(1)).toBe("Rifle");
  });

  then("they are offered no second weapon and no arena until the first is locked in", async ({gunsmith}) => {
    expect(await gunsmith.room.preRound.hasWeaponStep(2)).toBe(false);
    expect(await gunsmith.room.preRound.hasArenaStep()).toBe(false);
  });

  when("the first player locks in the submachine gun as their first weapon, alone", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.preRound.choose(1, "Submachine gun");
      await gunsmith.room.preRound.lockInWeapon(1);
    });

    then(
      "it is shown as locked in and their second weapon is now offered, the marksman rifle to begin with",
      async ({gunsmith}) => {
        expect(await gunsmith.room.preRound.getLockedWeapon(1)).toBe("Submachine gun");
        expect(await gunsmith.room.preRound.hasWeaponStep(2)).toBe(true);
        expect(await gunsmith.preRound.getChosen(2)).toBe("Marksman rifle");
        expect(await gunsmith.room.preRound.hasArenaStep()).toBe(false);
      },
    );

    when("the second player sits", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.room.joinWithASecondBrowserToChoose(code);
      });

      then("both are given the clock, counting down from the time to choose", async ({gunsmith}) => {
        const second = gunsmith.room.secondBrowser();

        await expect.poll(() => gunsmith.room.preRound.getSecondsLeft()).toBeLessThanOrEqual(SECONDS_TO_CHOOSE);
        await expect.poll(() => second.room.preRound.getSecondsLeft()).toBeLessThanOrEqual(SECONDS_TO_CHOOSE);
        expect(await gunsmith.room.preRound.isWaitingForTheOtherPlayerToSit()).toBe(false);
      });

      then(
        "neither is shown the other's first weapon, on the screen or by the server, while the other has not locked in theirs",
        async ({gunsmith}) => {
          const second = gunsmith.room.secondBrowser();

          await expect.poll(() => second.room.hasReceivedPreRounds()).toBe(true);
          expect(second.room.hasBeenToldTheOpponentsWeapon(1)).toBe(false);
          expect(gunsmith.room.hasBeenToldTheOpponentsWeapon(1)).toBe(false);
          expect(await second.room.preRound.getOpponentWeapon(1)).toBeUndefined();
          expect(await gunsmith.room.preRound.getOpponentWeapon(1)).toBeUndefined();
        },
      );

      when("the second player locks in the rifle as their first weapon", () => {
        beforeEach(async ({gunsmith}) => {
          await gunsmith.room.secondBrowser().room.preRound.lockInWeapon(1);
        });

        then("each is shown the other's first weapon", async ({gunsmith}) => {
          const second = gunsmith.room.secondBrowser();

          expect(await gunsmith.room.preRound.waitForTheOpponentWeapon(1)).toBe("Rifle");
          expect(await second.room.preRound.waitForTheOpponentWeapon(1)).toBe("Submachine gun");
        });

        then(
          "each is shown the other's first weapon as a card, with its picture, power rating and six stats, while still choosing their second",
          async ({gunsmith}) => {
            const second = gunsmith.room.secondBrowser();

            const rifle = await gunsmith.room.preRound.getOpponentWeaponNumbers(1);
            const submachineGun = await second.room.preRound.getOpponentWeaponNumbers(1);

            expect(rifle.name).toBe("Rifle");
            expect(submachineGun.name).toBe("Submachine gun");
            expect(Object.keys(rifle.stats)).toHaveLength(6);
            expect(Object.keys(submachineGun.stats)).toHaveLength(6);
            expect(rifle.stats).not.toEqual(submachineGun.stats);
            expect(rifle.rating).toBeGreaterThan(0);
            expect(rifle.rating).toBeLessThanOrEqual(100);
            expect(await gunsmith.room.preRound.getOpponentWeaponPicture(1)).toBe("sprite");
            expect(await second.room.preRound.getOpponentWeaponPicture(1)).toBe("sprite");
            expect(await gunsmith.room.preRound.getLockedWeapon(2)).toBeUndefined();
          },
        );

        then("neither is told the other's second weapon, which neither has chosen", async ({gunsmith}) => {
          const second = gunsmith.room.secondBrowser();

          await second.room.preRound.waitForTheOpponentWeapon(1);
          expect(gunsmith.room.hasBeenToldTheOpponentsWeapon(2)).toBe(false);
          expect(second.room.hasBeenToldTheOpponentsWeapon(2)).toBe(false);
        });

        when(
          "the first player locks in the marksman rifle as their second weapon, and the second player has not",
          () => {
            beforeEach(async ({gunsmith}) => {
              await gunsmith.room.preRound.lockInWeapon(2);
            });

            then("the second player is not told it, by the screen or by the server", async ({gunsmith}) => {
              const second = gunsmith.room.secondBrowser();

              await expect.poll(() => gunsmith.room.preRound.getLockedWeapon(2)).toBe("Marksman rifle");
              expect(second.room.hasBeenToldTheOpponentsWeapon(2)).toBe(false);
              expect(await second.room.preRound.getOpponentWeapon(2)).toBeUndefined();
            });

            when("the second player chooses the submachine gun and locks it in as their second weapon", () => {
              beforeEach(async ({gunsmith}) => {
                const second = gunsmith.room.secondBrowser();

                await second.preRound.choose(2, "Submachine gun");
                await second.room.preRound.lockInWeapon(2);
              });

              then("each is shown the other's second weapon, and the arena is offered", async ({gunsmith}) => {
                const second = gunsmith.room.secondBrowser();

                expect(await gunsmith.room.preRound.waitForTheOpponentWeapon(2)).toBe("Submachine gun");
                expect(await second.room.preRound.waitForTheOpponentWeapon(2)).toBe("Marksman rifle");
                expect(await gunsmith.room.preRound.hasArenaStep()).toBe(true);
              });

              then("the other's weapons fold to their picture and name, without their stats", async ({gunsmith}) => {
                await gunsmith.room.preRound.waitForTheOpponentWeapon(2);

                expect(await gunsmith.room.preRound.isOpponentWeaponShownAsACard(1)).toBe(false);
                expect(await gunsmith.room.preRound.isOpponentWeaponShownAsACard(2)).toBe(false);
                expect(await gunsmith.room.preRound.getOpponentWeaponPicture(1)).toBe("sprite");
                expect(await gunsmith.room.preRound.getOpponentWeaponPicture(2)).toBe("sprite");
              });

              when("the first player opens the other's first weapon", () => {
                beforeEach(async ({gunsmith}) => {
                  await gunsmith.room.preRound.waitForTheOpponentWeapon(2);
                  await gunsmith.room.preRound.openTheOpponentWeapon(1);
                });

                then(
                  "its power rating and six stats are shown, and the other weapon stays folded",
                  async ({gunsmith}) => {
                    const rifle = await gunsmith.room.preRound.getOpponentWeaponNumbers(1);

                    expect(rifle.name).toBe("Rifle");
                    expect(Object.keys(rifle.stats)).toHaveLength(6);
                    expect(await gunsmith.room.preRound.isOpponentWeaponShownAsACard(1)).toBe(true);
                    expect(await gunsmith.room.preRound.isOpponentWeaponShownAsACard(2)).toBe(false);
                  },
                );

                when("they press anywhere on its card", () => {
                  beforeEach(async ({gunsmith}) => {
                    await gunsmith.room.preRound.pressTheOpponentWeaponCard(1);
                  });

                  then("it folds to its picture and name again", async ({gunsmith}) => {
                    expect(await gunsmith.room.preRound.isOpponentWeaponShownAsACard(1)).toBe(false);
                    expect(await gunsmith.room.preRound.getOpponentWeapon(1)).toBe("Rifle");
                  });
                });
              });

              when("both lock in the Duel as their arena", () => {
                beforeEach(async ({gunsmith}) => {
                  const second = gunsmith.room.secondBrowser();

                  await gunsmith.room.preRound.lockInArena();
                  await second.room.preRound.lockInArena();
                  await gunsmith.room.waitForTheMatch();
                  await second.room.waitForTheMatch();
                });

                then("the match begins and the choosing is gone from both screens", async ({gunsmith}) => {
                  expect(await gunsmith.room.preRound.isOpen()).toBe(false);
                  expect(await gunsmith.room.secondBrowser().room.preRound.isOpen()).toBe(false);
                });

                then("each fighter has their first weapon in hand", async ({gunsmith}) => {
                  const second = gunsmith.room.secondBrowser();

                  await expect
                    .poll(async () => (await gunsmith.hud.getInventory()).selectedName)
                    .toBe("Submachine gun");
                  await expect.poll(async () => (await second.hud.getInventory()).selectedName).toBe("Rifle");
                });

                when("both switch to their second weapon", () => {
                  beforeEach(async ({gunsmith}) => {
                    await gunsmith.player.switchTo(2);
                    await gunsmith.room.secondBrowser().player.switchTo(2);
                  });

                  then("each has the second weapon they chose", async ({gunsmith}) => {
                    const second = gunsmith.room.secondBrowser();

                    await expect
                      .poll(async () => (await gunsmith.hud.getInventory()).selectedName)
                      .toBe("Marksman rifle");
                    await expect
                      .poll(async () => (await second.hud.getInventory()).selectedName)
                      .toBe("Submachine gun");
                  });
                });

                when("the first player walks south for half a second", () => {
                  let walked = 0;

                  beforeEach(async ({gunsmith}) => {
                    const before = await gunsmith.player.getPosition();

                    await gunsmith.player.walkFor("south", 0.5);

                    const after = await gunsmith.player.getPosition();
                    walked = Math.hypot(after.x - before.x, after.y - before.y);
                  });

                  then("the keys are the game's again, so they have moved", () => {
                    expect(walked).toBeGreaterThan(0.5);
                  });
                });
              });
            });
          },
        );
      });
    });
  });
});

given("a private room that gives its players eight seconds to choose", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom({preRoundSeconds: SECONDS_TO_CHOOSE_QUICKLY});

    await gunsmith.room.preRound.waitToBeChoosing();
    await gunsmith.room.joinWithASecondBrowserToChoose(code);
  });

  when("the first player locks in only the submachine gun as their first weapon and the second does nothing", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.preRound.choose(1, "Submachine gun");
      await gunsmith.room.preRound.lockInWeapon(1);
      await expect.poll(() => gunsmith.room.hasReceivedSnapshots(), {timeout: MATCH_AFTER_THE_CLOCK_MS}).toBe(true);
      await expect
        .poll(() => gunsmith.room.secondBrowser().room.hasReceivedSnapshots(), {timeout: MATCH_AFTER_THE_CLOCK_MS})
        .toBe(true);
    });

    then(
      "the clock ran out and began the match: the first keeps the submachine gun, the second has the rifle",
      async ({gunsmith}) => {
        const second = gunsmith.room.secondBrowser();

        await expect.poll(async () => (await gunsmith.hud.getInventory()).selectedName).toBe("Submachine gun");
        await expect.poll(async () => (await second.hud.getInventory()).selectedName).toBe("Rifle");
      },
    );

    when("both switch to their second weapon", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.switchTo(2);
        await gunsmith.room.secondBrowser().player.switchTo(2);
      });

      then("each has the marksman rifle, the default for the second slot", async ({gunsmith}) => {
        const second = gunsmith.room.secondBrowser();

        await expect.poll(async () => (await gunsmith.hud.getInventory()).selectedName).toBe("Marksman rifle");
        await expect.poll(async () => (await second.hud.getInventory()).selectedName).toBe("Marksman rifle");
      });
    });
  });
});

given("a private room whose first player has locked in a weapon while alone and then lost their connection", () => {
  let code = "";

  beforeEach(async ({gunsmith}) => {
    await gunsmith.room.prepareToLoseTheConnection();
    code = await gunsmith.room.createPrivateRoom({preRoundSeconds: SECONDS_TO_CHOOSE});
    await gunsmith.room.preRound.waitToBeChoosing();
    await gunsmith.preRound.choose(1, "Marksman rifle");
    await gunsmith.room.preRound.lockInWeapon(1);
    await gunsmith.room.cutTheConnection();
    await gunsmith.room.waitToBeSeatedAgain();
  });

  when("the second player sits and locks in the rifle as their first weapon", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.room.joinWithASecondBrowserToChoose(code);
      await gunsmith.room.secondBrowser().room.preRound.lockInWeapon(1);
    });

    then("the first player's lock was not lost with the connection: the second is shown it", async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      expect(await second.room.preRound.waitForTheOpponentWeapon(1)).toBe("Marksman rifle");
      expect(await gunsmith.room.preRound.waitForTheOpponentWeapon(1)).toBe("Rifle");
    });
  });
});

// A real room offers the day's five arenas, which five depending on the date, and the dialog must show Lock in arena without scrolling at
// 1280 by 720 whichever they are: the other's weapons are folded by then, and the arenas sit three to a row beside their preview.
given("a private room offering the day's arenas, where both players have locked in both weapons", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom({preRoundSeconds: SECONDS_TO_CHOOSE, daysArenas: true});
    await gunsmith.room.preRound.waitToBeChoosing();
    await gunsmith.room.joinWithASecondBrowserToChoose(code);
    const second = gunsmith.room.secondBrowser();

    for (const slot of [1, 2]) {
      await gunsmith.room.preRound.lockInWeapon(slot);
      await second.room.preRound.lockInWeapon(slot);
    }
    await gunsmith.room.preRound.waitForTheOpponentWeapon(2);
  });

  then("the day's arenas are laid out three to a row", async ({gunsmith}) => {
    expect(await gunsmith.preRound.arena.getChoicesInEachRow()).toEqual([3, 2]);
  });

  then("the arena can be locked in without scrolling, with the other's weapons folded", async ({gunsmith}) => {
    expect(await gunsmith.room.preRound.isOpponentWeaponShownAsACard(1)).toBe(false);
    expect(await gunsmith.room.preRound.isOpponentWeaponShownAsACard(2)).toBe(false);
    expect(await gunsmith.room.preRound.canLockInTheArenaWithoutScrolling()).toBe(true);
  });
});
