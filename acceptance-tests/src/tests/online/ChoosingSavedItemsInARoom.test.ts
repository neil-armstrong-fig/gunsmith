import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A signed-in player's saved weapons and arenas can be taken into a private room: the choosing offers them after the built-ins, and what the page
// puts forward is the item's id from the account's library, never its name or its body (the server looks the id up among that account's saved items).
// These specs read what the page offered and what it sent. The room's server sees no session here, so it refuses the saved ids; that refusal
// is the server's own tests', and a saved item played end to end waits for a way to sign a seat in locally. The room offers every built-in
// arena, not the day's five (`addressOfRoom`'s default), so the Duel and the Fair duel are always there to choose.
const BUILT_IN_WEAPONS = ["Rifle", "Marksman rifle", "Submachine gun"];
const FIRST_SAVED_WEAPON = "Mint Coil";
const SECOND_SAVED_WEAPON = "Ember Lance";
const SAVED_ARENA = "Foundry";
const SECONDS_TO_CHOOSE = 60;

given("a private room, for a signed-in player whose library holds two saved weapons and a saved arena", () => {
  let firstWeaponId = "";
  let secondWeaponId = "";
  let arenaId = "";

  beforeEach(async ({gunsmith}) => {
    const saved = await gunsmith.room.preRound.arrangeSignedInPlayer("two saved weapons and an arena");
    firstWeaponId = saved.firstWeaponId;
    secondWeaponId = saved.secondWeaponId;
    arenaId = saved.arenaId;

    await gunsmith.room.createPrivateRoom({preRoundSeconds: SECONDS_TO_CHOOSE});
    await gunsmith.room.preRound.waitToBeChoosing();
  });

  then("the first weapon is chosen from the built-ins and then their saved weapon", async ({gunsmith}) => {
    await expect
      .poll(() => gunsmith.preRound.getChoices(1))
      .toEqual([...BUILT_IN_WEAPONS, FIRST_SAVED_WEAPON, SECOND_SAVED_WEAPON]);
    expect(await gunsmith.preRound.getChosen(1)).toBe("Rifle");
  });

  when("they lock in the saved weapon as their first weapon", () => {
    beforeEach(async ({gunsmith}) => {
      await expect.poll(() => gunsmith.preRound.getChoices(1)).toContain(FIRST_SAVED_WEAPON);
      await gunsmith.preRound.choose(1, FIRST_SAVED_WEAPON);
      await gunsmith.room.preRound.lockInWeapon(1);
    });

    then("the page puts it forward for the first slot by its library id", async ({gunsmith}) => {
      expect(gunsmith.room.getChoicesSent()).toContainEqual({
        step: "weapon",
        slot: 1,
        kind: "saved",
        reference: firstWeaponId,
      });
    });

    when("they lock in their other saved weapon as their second weapon", () => {
      beforeEach(async ({gunsmith}) => {
        await expect.poll(() => gunsmith.preRound.getChoices(2)).toContain(SECOND_SAVED_WEAPON);
        await gunsmith.preRound.choose(2, SECOND_SAVED_WEAPON);
        await gunsmith.room.preRound.lockInWeapon(2);
      });

      then("the page puts it forward for the second slot by its library id", async ({gunsmith}) => {
        expect(gunsmith.room.getChoicesSent()).toContainEqual({
          step: "weapon",
          slot: 2,
          kind: "saved",
          reference: secondWeaponId,
        });
      });

      then(
        "the arena is chosen from the built-ins and then their saved arena, the Duel to begin with",
        async ({gunsmith}) => {
          await expect
            .poll(() => gunsmith.preRound.arena.getChoices())
            .toEqual([...(gunsmith.room.getArenasOffered() ?? []), SAVED_ARENA]);
          expect(await gunsmith.preRound.arena.getChosen()).toBe("Duel");
        },
      );

      when("they choose the saved arena", () => {
        beforeEach(async ({gunsmith}) => {
          await expect.poll(() => gunsmith.preRound.arena.getChoices()).toContain(SAVED_ARENA);
          await gunsmith.preRound.arena.choose(SAVED_ARENA);
        });

        then("a preview of it is shown", async ({gunsmith}) => {
          expect(await gunsmith.preRound.arena.getPreviewName()).toBe(SAVED_ARENA);
        });
      });

      when("they lock in the saved arena", () => {
        beforeEach(async ({gunsmith}) => {
          await expect.poll(() => gunsmith.preRound.arena.getChoices()).toContain(SAVED_ARENA);
          await gunsmith.preRound.arena.choose(SAVED_ARENA);
          await gunsmith.room.preRound.lockInArena();
        });

        then("the page puts it forward by its library id", async ({gunsmith}) => {
          expect(gunsmith.room.getChoicesSent()).toContainEqual({
            step: "arena",
            slot: undefined,
            kind: "saved",
            reference: arenaId,
          });
        });
      });

      when("they lock in a built-in arena", () => {
        beforeEach(async ({gunsmith}) => {
          await gunsmith.preRound.arena.choose("Fair duel");
          await gunsmith.room.preRound.lockInArena();
        });

        then("the page puts it forward as a built-in, by its name", async ({gunsmith}) => {
          expect(gunsmith.room.getChoicesSent()).toContainEqual({
            step: "arena",
            slot: undefined,
            kind: "builtIn",
            reference: "Fair duel",
          });
        });
      });
    });
  });

  when("they lock in a built-in weapon as their first weapon", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.preRound.choose(1, "Submachine gun");
      await gunsmith.room.preRound.lockInWeapon(1);
    });

    then("the page puts it forward as a built-in, by its key", async ({gunsmith}) => {
      expect(gunsmith.room.getChoicesSent()).toContainEqual({
        step: "weapon",
        slot: 1,
        kind: "builtIn",
        reference: "submachine-gun",
      });
    });
  });
});

given("a private room, for a guest who is not signed in", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.room.createPrivateRoom({preRoundSeconds: SECONDS_TO_CHOOSE});
    await gunsmith.room.preRound.waitToBeChoosing();
  });

  then("only the built-in weapons are offered", async ({gunsmith}) => {
    expect(await gunsmith.preRound.getChoices(1)).toEqual(BUILT_IN_WEAPONS);
  });

  when("they lock in the rifle as their first weapon", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.room.preRound.lockInWeapon(1);
    });

    then("the page puts forward a built-in and no saved item", async ({gunsmith}) => {
      const sent = gunsmith.room.getChoicesSent();

      expect(sent).toContainEqual({step: "weapon", slot: 1, kind: "builtIn", reference: "rifle"});
      expect(sent.filter(choice => choice.kind === "saved")).toEqual([]);
    });
  });
});

given("a private room, for a guest whose own shelf in this browser holds a weapon they made", () => {
  let madeName = "";

  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.open();
    await gunsmith.workshop.pasteThePrompt("a fast firing weapon");
    await gunsmith.workshop.make();
    madeName = (await gunsmith.workshop.getResult()).name;
    await gunsmith.workshop.shelf.save();
    await gunsmith.workshop.close();
    await gunsmith.room.createPrivateRoom({preRoundSeconds: SECONDS_TO_CHOOSE});
    await gunsmith.room.preRound.waitToBeChoosing();
  });

  then("it is not offered, because the room cannot know an id the browser's own shelf gave it", async ({gunsmith}) => {
    const choices = await gunsmith.preRound.getChoices(1);

    expect(madeName).not.toBe("");
    expect(choices).toEqual(BUILT_IN_WEAPONS);
  });
});

given("a signed-in player who locked in a saved weapon in one room and has since lost it from their library", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.room.preRound.arrangeSignedInPlayer("two saved weapons and an arena");
    await gunsmith.room.createPrivateRoom({preRoundSeconds: SECONDS_TO_CHOOSE});
    await expect.poll(() => gunsmith.preRound.getChoices(1)).toContain(FIRST_SAVED_WEAPON);
    await gunsmith.preRound.choose(1, FIRST_SAVED_WEAPON);
    await gunsmith.room.preRound.lockInWeapon(1);
    await gunsmith.room.preRound.arrangeSignedInPlayer("nothing saved");
    await gunsmith.room.createPrivateRoom({preRoundSeconds: SECONDS_TO_CHOOSE});
    await gunsmith.room.preRound.waitToBeChoosing();
  });

  then("the next room begins on the rifle again", async ({gunsmith}) => {
    expect(await gunsmith.preRound.getChoices(1)).toEqual(BUILT_IN_WEAPONS);
    expect(await gunsmith.preRound.getChosen(1)).toBe("Rifle");
  });
});
