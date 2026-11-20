import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const FAST_PROMPT = "a fast little submachine gun";
const LONG_RANGE_PROMPT = "a long range sniper";

given("the workshop is open, with one weapon saved", () => {
  let name = "";
  let magazine = 0;
  let reserve = 0;

  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.open();
    await gunsmith.workshop.typeThePrompt(FAST_PROMPT);
    await gunsmith.workshop.make();

    const result = await gunsmith.workshop.getResult();
    name = result.name.toLowerCase();
    magazine = Number.parseInt(result.stats["Magazine"] ?? "", 10);
    reserve = Number.parseInt(result.stats["Reserve"] ?? "", 10);

    await gunsmith.workshop.shelf.save();
  });

  when("the player presses Try it on the saved weapon", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.shelf.tryItem(0);
    });

    then("the workshop is shut and the weapon is in hand, in slot 2", async ({gunsmith}) => {
      expect(await gunsmith.workshop.isOpen()).toBe(false);

      await gunsmith.weapon.waitForSlot(2);

      expect((await gunsmith.hud.getInventory()).selectedName.toLowerCase()).toBe(name);
    });

    then("its magazine and its reserve are full", async ({gunsmith}) => {
      const weapon = await gunsmith.weapon.get();

      expect(weapon.rounds).toBe(magazine);
      expect(weapon.reserve).toBe(reserve);
    });
  });

  when("the player deletes the saved weapon", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.shelf.deleteItem(0);
    });

    then("the shelf is empty", async ({gunsmith}) => {
      expect(await gunsmith.workshop.shelf.getItems()).toEqual([]);
      expect((await gunsmith.workshop.shelf.getMeter()).count).toBe(0);
    });

    then("the card offers Save again, since its weapon is no longer kept", async ({gunsmith}) => {
      expect(await gunsmith.workshop.shelf.isSaved()).toBe(false);
      expect(await gunsmith.workshop.shelf.canSave()).toBe(true);
    });
  });

  when("the player makes a different weapon and then presses Iterate on the saved one", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.pasteThePrompt(LONG_RANGE_PROMPT);
      await gunsmith.workshop.make();
      await gunsmith.workshop.shelf.iterateItem(0);
    });

    then("the box holds the words the saved weapon was made from", async ({gunsmith}) => {
      expect(await gunsmith.workshop.getPrompt()).toBe(FAST_PROMPT);
    });

    then("the card shows the saved weapon, and says it is saved", async ({gunsmith}) => {
      expect((await gunsmith.workshop.getResult()).name.toLowerCase()).toBe(name);
      expect(await gunsmith.workshop.shelf.isSaved()).toBe(true);
    });

    then("the shelf still holds the one weapon", async ({gunsmith}) => {
      expect((await gunsmith.workshop.shelf.getMeter()).count).toBe(1);
    });
  });
});

given("the workshop is open, with the shelf full of fast weapons", () => {
  const promptBeginning = `${FAST_PROMPT} with a compact grip${" and a bright stripe".repeat(18)}`;
  let limit = 0;
  let fastName = "";
  let longRangeName = "";

  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.open();

    limit = (await gunsmith.workshop.shelf.getMeter()).limit;
    for (let saved = 0; saved < limit; saved++) {
      await gunsmith.workshop.pasteThePrompt(`${promptBeginning} for practice target ${saved + 1}`);
      await gunsmith.workshop.make();
      await gunsmith.workshop.shelf.save();
    }

    fastName = (await gunsmith.workshop.getResult()).name;
  });

  then("the shelf says it is full", async ({gunsmith}) => {
    expect(await gunsmith.workshop.shelf.getMeter()).toEqual({count: limit, limit});
  });

  when("the player makes another weapon and presses Save", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.pasteThePrompt(LONG_RANGE_PROMPT);
      await gunsmith.workshop.make();

      longRangeName = (await gunsmith.workshop.getResult()).name;

      await gunsmith.workshop.shelf.save();
    });

    then("the card asks which saved weapon to replace, and the shelf is as it was", async ({gunsmith}) => {
      expect(await gunsmith.workshop.shelf.isAskingWhichToReplace()).toBe(true);

      const items = await gunsmith.workshop.shelf.getItems();

      expect(items).toHaveLength(limit);
      expect(items.every(item => item.name === fastName)).toBe(true);
    });

    then(
      "the picker shows the saved prompts that distinguish weapons of the same name and rating",
      async ({gunsmith}) => {
        const items = await gunsmith.workshop.shelf.getItems();

        expect(new Set(items.map(item => item.name)).size).toBe(1);
        expect(new Set(items.map(item => item.rating)).size).toBe(1);
        expect(new Set(items.map(item => item.prompt)).size).toBe(limit);
        expect(await gunsmith.workshop.shelf.getReplacementPrompts()).toEqual(items.map(item => item.prompt));
      },
    );

    when("the player replaces the second saved weapon", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.workshop.shelf.replaceItem(1);
      });

      then("the new weapon stands in its place and every other weapon is untouched", async ({gunsmith}) => {
        const items = await gunsmith.workshop.shelf.getItems();

        expect(items).toHaveLength(limit);
        expect(items.map(item => item.name)).toEqual(
          Array.from({length: limit}, (_, index) => (index === 1 ? longRangeName : fastName)),
        );
        expect(items.map(item => item.prompt)).toEqual(
          Array.from({length: limit}, (_, index) => {
            if (index === 1) return LONG_RANGE_PROMPT;

            return `${promptBeginning} for practice target ${index + 1}`;
          }),
        );
      });

      then("the question is gone and the card says Saved", async ({gunsmith}) => {
        expect(await gunsmith.workshop.shelf.isAskingWhichToReplace()).toBe(false);
        expect(await gunsmith.workshop.shelf.isSaved()).toBe(true);
      });
    });

    when("the player makes another weapon without answering", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.workshop.pasteThePrompt(FAST_PROMPT);
        await gunsmith.workshop.make();
      });

      then("the question is gone, since it was about the weapon before", async ({gunsmith}) => {
        expect(await gunsmith.workshop.shelf.isAskingWhichToReplace()).toBe(false);
        expect(await gunsmith.workshop.shelf.canSave()).toBe(true);
      });
    });

    when("the player cancels", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.workshop.shelf.cancelReplace();
      });

      then("nothing is saved or lost", async ({gunsmith}) => {
        const items = await gunsmith.workshop.shelf.getItems();

        expect(items).toHaveLength(limit);
        expect(items.every(item => item.name === fastName)).toBe(true);
      });

      then("the question is gone and Save can be pressed again", async ({gunsmith}) => {
        expect(await gunsmith.workshop.shelf.isAskingWhichToReplace()).toBe(false);
        expect(await gunsmith.workshop.shelf.canSave()).toBe(true);
      });
    });
  });
});
