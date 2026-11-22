import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const FAST_PROMPT = "a fast little submachine gun";
const LONG_RANGE_PROMPT = "a long range sniper";

// East of the start (12.5, 7.5) the middle row of the practice range is clear to the wall, so half a second of walking is a clear distance.
const HALF_A_SECOND = 0.5;
const CLEARLY_WALKED_TILES = 0.5;

given("the workshop is open on the practice range", () => {
  let rifleName = "";

  beforeEach(async ({gunsmith}) => {
    rifleName = (await gunsmith.hud.getInventory()).selectedName.toLowerCase();
    await gunsmith.workshop.open();
  });

  when("nothing has been made yet", () => {
    then("there is no Try it to press", async ({gunsmith}) => {
      expect(await gunsmith.workshop.hasTryIt()).toBe(false);
    });
  });

  when("the player makes a weapon", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.pasteThePrompt(FAST_PROMPT);
      await gunsmith.workshop.make();
    });

    then("the result card offers Try it", async ({gunsmith}) => {
      expect(await gunsmith.workshop.hasTryIt()).toBe(true);
    });
  });

  when("the player makes a weapon and presses Try it", () => {
    let name = "";
    let magazine = 0;
    let reserve = 0;

    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.pasteThePrompt(FAST_PROMPT);
      await gunsmith.workshop.make();

      const result = await gunsmith.workshop.getResult();
      name = result.name.toLowerCase();
      magazine = Number.parseInt(result.stats["Magazine"] ?? "", 10);
      reserve = Number.parseInt(result.stats["Reserve"] ?? "", 10);

      await gunsmith.workshop.tryIt();
    });

    then("the workshop is shut", async ({gunsmith}) => {
      expect(await gunsmith.workshop.isOpen()).toBe(false);
    });

    then("the made weapon is in hand, in slot 2", async ({gunsmith}) => {
      await gunsmith.weapon.waitForSlot(2);

      expect((await gunsmith.hud.getInventory()).selectedName.toLowerCase()).toBe(name);
    });

    then("its magazine and its reserve are full, as the card says", async ({gunsmith}) => {
      const weapon = await gunsmith.weapon.get();

      expect(weapon.rounds).toBe(magazine);
      expect(weapon.reserve).toBe(reserve);
    });

    when("the player switches back to slot 1", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.switchTo(1);
        await gunsmith.weapon.waitForSlot(1);
      });

      then("the rifle is still there", async ({gunsmith}) => {
        expect((await gunsmith.hud.getInventory()).selectedName.toLowerCase()).toBe(rifleName);
      });
    });

    when("the player opens the workshop again", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.workshop.open();
      });

      then("the prompt is as it was", async ({gunsmith}) => {
        expect(await gunsmith.workshop.getPrompt()).toBe(FAST_PROMPT);
      });

      then("the result card is as it was", async ({gunsmith}) => {
        expect((await gunsmith.workshop.getResult()).name.toLowerCase()).toBe(name);
      });

      when("the player makes another weapon and presses Try it", () => {
        let anotherName = "";

        beforeEach(async ({gunsmith}) => {
          await gunsmith.workshop.pasteThePrompt(LONG_RANGE_PROMPT);
          await gunsmith.workshop.make();

          anotherName = (await gunsmith.workshop.getResult()).name.toLowerCase();

          await gunsmith.workshop.tryIt();
        });

        then("the new weapon takes the place of the first in slot 2", async ({gunsmith}) => {
          await gunsmith.weapon.waitForSlot(2);

          expect(anotherName).not.toBe(name);
          expect((await gunsmith.hud.getInventory()).selectedName.toLowerCase()).toBe(anotherName);
        });
      });
    });
  });
});

given("the practice range, held still, with a weapon made and the workshop open", () => {
  let startX = 0;
  let endX = 0;

  beforeEach(async ({gunsmith}) => {
    await gunsmith.holdTheGame();

    startX = (await gunsmith.player.getPosition()).x;

    await gunsmith.workshop.open();
    await gunsmith.workshop.pasteThePrompt(FAST_PROMPT);
    await gunsmith.workshop.make();
  });

  when("the player presses Try it and holds the walk key", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.tryIt();
      await gunsmith.player.startWalking("east");
      await gunsmith.runGameFor(HALF_A_SECOND);
      await gunsmith.player.stopWalking("east");

      endX = (await gunsmith.player.getPosition()).x;
    });

    then("the game goes on and the player walks", () => {
      expect(endX).toBeGreaterThan(startX + CLEARLY_WALKED_TILES);
    });
  });
});
