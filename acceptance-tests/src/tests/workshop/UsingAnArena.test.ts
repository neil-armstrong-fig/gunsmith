import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const PILLAR_PROMPT = "a yard with one pillar";
const RAISED_PROMPT = "a raised platform with stairs";

given("the arena workshop is open on the practice range", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.open();
    await gunsmith.workshop.arenas.open();
    await gunsmith.workshop.pasteThePrompt(PILLAR_PROMPT);
    await gunsmith.workshop.make();
  });

  when("the player walks the result", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.arenas.pressArenaAction("Walk it");
    });

    then("the workshop shuts and the actual arena is playable without a saved item", async ({gunsmith}) => {
      expect(await gunsmith.workshop.isOpen()).toBe(false);
      expect(await gunsmith.arena.getSizeInTiles()).toEqual({width: 16, height: 8});
    });

    when("the player moves east and presses the practice reset key", () => {
      let startX = 0;

      beforeEach(async ({gunsmith}) => {
        startX = (await gunsmith.player.getPosition()).x;
        await gunsmith.player.walkFor("east", 0.3);
        await gunsmith.workshop.resetTheRange();
      });

      then("the player moves on the arena floor and the range dummies stay out", async ({gunsmith}) => {
        expect((await gunsmith.player.getPosition()).x).toBeGreaterThan(startX);
        expect(await gunsmith.dummies.getAll()).toEqual([]);
      });
    });

    when("the player returns from the workshop", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.workshop.open();
        await gunsmith.workshop.arenas.pressArenaAction("Return to practice");
      });

      then("the practice range is restored", async ({gunsmith}) => {
        expect(await gunsmith.workshop.isOpen()).toBe(false);
        expect(await gunsmith.arena.getSizeInTiles()).toEqual({width: 24, height: 14});
      });
    });
  });

  when("the player edits the prompt before saving, then reloads and iterates", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.pasteThePrompt(RAISED_PROMPT);
      await gunsmith.workshop.arenas.pressArenaAction("Save");
      await gunsmith.reloadThePage();
      await gunsmith.workshop.open();
      await gunsmith.workshop.arenas.open();
      await gunsmith.workshop.arenas.pressArenaAction("Iterate");
    });

    then("the shelf restores the original words and the result they made", async ({gunsmith}) => {
      expect(await gunsmith.workshop.arenas.getSavedArenaPrompts()).toEqual([PILLAR_PROMPT]);
      expect(await gunsmith.workshop.getPrompt()).toBe(PILLAR_PROMPT);
      expect(await gunsmith.workshop.arenas.getResultDescription()).toContain("16 × 8");
    });

    then("the browser-local shelf previews the saved pillar and floor", async ({gunsmith}) => {
      const [pillar, floor] = await gunsmith.workshop.arenas.getSavedArenaColours(
        "Stand-in Pillar Yard",
        {width: 16, height: 8},
        [
          {x: 4.5, y: 4.5},
          {x: 5.5, y: 4.5},
        ],
      );
      expect(floor?.green).toBe(43);
      expect(pillar?.green).toBeLessThan(43);
    });

    when("the player deletes the saved item", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.workshop.arenas.pressArenaAction("Delete");
      });

      then("the shelf is empty and the open result is still available", async ({gunsmith}) => {
        expect(await gunsmith.workshop.arenas.getSavedArenaPrompts()).toEqual([]);
        expect(await gunsmith.workshop.arenas.getResultDescription()).toContain("16 × 8");
      });
    });

    when("the player walks the saved arena directly from the shelf", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.workshop.arenas.pressArenaAction("Walk it", 1);
      });

      then("the saved layout is playable after a reload", async ({gunsmith}) => {
        expect(await gunsmith.workshop.isOpen()).toBe(false);
        expect(await gunsmith.arena.getSizeInTiles()).toEqual({width: 16, height: 8});
      });
    });
  });

  when("the arena shelf fills and the player asks to save a different arena", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.arenas.pressArenaAction("Save");
      for (const prompt of ["a pillar on the west side", "a pillar in the yard"]) {
        await gunsmith.workshop.pasteThePrompt(prompt);
        await gunsmith.workshop.make();
        await gunsmith.workshop.arenas.pressArenaAction("Save");
      }
      await gunsmith.workshop.pasteThePrompt(RAISED_PROMPT);
      await gunsmith.workshop.make();
      await gunsmith.workshop.arenas.pressArenaAction("Save");
    });

    then("every saved item stays until the player chooses a replacement", async ({gunsmith}) => {
      expect(await gunsmith.workshop.arenas.getSavedArenaPrompts()).toEqual([
        PILLAR_PROMPT,
        "a pillar on the west side",
        "a pillar in the yard",
      ]);
    });

    when("the player chooses the middle arena", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.workshop.arenas.pressArenaAction("Replace", 1);
      });

      then("the new arena replaces exactly that entry", async ({gunsmith}) => {
        expect(await gunsmith.workshop.arenas.getSavedArenaPrompts()).toEqual([
          PILLAR_PROMPT,
          RAISED_PROMPT,
          "a pillar in the yard",
        ]);
      });
    });
  });
});
