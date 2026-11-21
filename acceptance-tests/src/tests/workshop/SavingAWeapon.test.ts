import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const FAST_PROMPT = "a fast little submachine gun";
const LONG_RANGE_PROMPT = "a long range sniper";

given("the workshop is open on the practice range, with nothing saved", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.open();
  });

  when("nothing has been made yet", () => {
    then("there is nothing to save", async ({gunsmith}) => {
      expect(await gunsmith.workshop.shelf.canSave()).toBe(false);
    });

    then("the shelf is empty and says how many it holds", async ({gunsmith}) => {
      const meter = await gunsmith.workshop.shelf.getMeter();

      expect(meter.count).toBe(0);
      expect(meter.limit).toBeGreaterThan(0);
      expect(await gunsmith.workshop.shelf.getItems()).toEqual([]);
    });
  });

  when("the player makes a weapon", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.pasteThePrompt(FAST_PROMPT);
      await gunsmith.workshop.make();
    });

    then("Save is offered and the weapon is not on the shelf", async ({gunsmith}) => {
      expect(await gunsmith.workshop.shelf.canSave()).toBe(true);
      expect(await gunsmith.workshop.shelf.isSaved()).toBe(false);
      expect((await gunsmith.workshop.shelf.getMeter()).count).toBe(0);
    });

    when("the player saves it", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.workshop.shelf.save();
      });

      then("the shelf holds that weapon, with its name, its rating and its prompt", async ({gunsmith}) => {
        const result = await gunsmith.workshop.getResult();

        expect(await gunsmith.workshop.shelf.getItems()).toEqual([
          {name: result.name, rating: result.rating, prompt: FAST_PROMPT},
        ]);
      });

      then("the shelf counts one", async ({gunsmith}) => {
        expect((await gunsmith.workshop.shelf.getMeter()).count).toBe(1);
      });

      then("the card says Saved and offers no second Save", async ({gunsmith}) => {
        expect(await gunsmith.workshop.shelf.isSaved()).toBe(true);
        expect(await gunsmith.workshop.shelf.canSave()).toBe(false);
      });

      when("the player presses Escape", () => {
        beforeEach(async ({gunsmith}) => {
          await gunsmith.workshop.close();
        });

        then("the workshop shuts, though the Save button that had the focus is now disabled", async ({gunsmith}) => {
          expect(await gunsmith.workshop.isOpen()).toBe(false);
        });
      });

      when("the page is reloaded and the workshop opened again", () => {
        let name = "";
        let rating = 0;

        beforeEach(async ({gunsmith}) => {
          ({name, rating} = await gunsmith.workshop.getResult());
          await gunsmith.reloadThePage();
          await gunsmith.workshop.open();
        });

        then("the weapon is still on the shelf", async ({gunsmith}) => {
          expect(await gunsmith.workshop.shelf.getItems()).toEqual([{name, rating, prompt: FAST_PROMPT}]);

          expect((await gunsmith.workshop.shelf.getMeter()).count).toBe(1);
        });
      });

      when("the player makes another weapon", () => {
        beforeEach(async ({gunsmith}) => {
          await gunsmith.workshop.pasteThePrompt(LONG_RANGE_PROMPT);
          await gunsmith.workshop.make();
        });

        then("the new weapon can be saved, and the first stays where it is", async ({gunsmith}) => {
          expect(await gunsmith.workshop.shelf.canSave()).toBe(true);
          expect(await gunsmith.workshop.shelf.isSaved()).toBe(false);
          expect((await gunsmith.workshop.shelf.getMeter()).count).toBe(1);
        });

        when("the player saves that too", () => {
          beforeEach(async ({gunsmith}) => {
            await gunsmith.workshop.shelf.save();
          });

          then("the shelf holds both, the first made first", async ({gunsmith}) => {
            const items = await gunsmith.workshop.shelf.getItems();

            expect(items.map(item => item.prompt)).toEqual([FAST_PROMPT, LONG_RANGE_PROMPT]);
          });
        });
      });
    });
  });

  when("the player makes a weapon, then changes the words in the box, then saves", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.pasteThePrompt(FAST_PROMPT);
      await gunsmith.workshop.make();
      await gunsmith.workshop.pasteThePrompt(LONG_RANGE_PROMPT);
      await gunsmith.workshop.shelf.save();
    });

    then("the shelf keeps the words that made the weapon, not the ones now in the box", async ({gunsmith}) => {
      const items = await gunsmith.workshop.shelf.getItems();

      expect(items.map(item => item.prompt)).toEqual([FAST_PROMPT]);
    });
  });
});
