import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

given("a signed-in player makes an arena in the workshop", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.arenas.arrangeSignedInArena();

    await gunsmith.workshop.open();
    await gunsmith.workshop.arenas.open();
    await gunsmith.workshop.pasteThePrompt("a wide industrial yard");
    await gunsmith.workshop.make();
  });

  then("the generated arena is previewed", async ({gunsmith}) => {
    await expect.poll(() => gunsmith.workshop.arenas.getResultDescription()).toContain("12 × 9");
    expect(await gunsmith.workshop.arenas.usesWebGl("Foundry")).toBe(true);
  });

  when("the player walks the result", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.arenas.pressArenaAction("Walk it");
    });

    then("the generated layout is playable", async ({gunsmith}) => {
      expect(await gunsmith.arena.getSizeInTiles()).toEqual({width: 12, height: 9});
    });
  });

  when("the player saves the arena and reloads the page", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.arenas.pressArenaAction("Save");
      await expect.poll(() => gunsmith.workshop.arenas.getSavedArenaPrompts()).toEqual(["a wide industrial yard"]);

      await gunsmith.browser.reloadThePage();
      await gunsmith.workshop.open();
      await gunsmith.workshop.arenas.open();
    });

    then("the account shelf previews the restored wall and floor", async ({gunsmith}) => {
      const [wall, floor] = await gunsmith.workshop.arenas.getSavedArenaColours("Foundry", {width: 12, height: 9}, [
        {x: 4.5, y: 5.5},
        {x: 3.5, y: 5.5},
      ]);
      expect(floor?.green).toBe(43);
      expect(wall?.green).toBeLessThan(43);
    });

    when("the player walks the restored layout", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.workshop.arenas.pressArenaAction("Walk it");
      });

      then("the account shelf restores the playable layout", async ({gunsmith}) => {
        expect(await gunsmith.arena.getSizeInTiles()).toEqual({width: 12, height: 9});
      });
    });
  });
});

given("a signed-in player has a saved arena while generation is paused", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.arenas.arrangeSignedInArena("paused");

    await gunsmith.workshop.open();
    await gunsmith.workshop.arenas.open();
    await gunsmith.workshop.pasteThePrompt("a wide industrial yard");
    await gunsmith.workshop.make();
  });

  then("the workshop says generation is paused", async ({gunsmith}) => {
    await expect.poll(() => gunsmith.workshop.arenas.getMakeError()).toBe("Arena generation is paused.");
  });

  when("the player walks their saved arena", () => {
    beforeEach(async ({gunsmith}) => {
      await expect.poll(() => gunsmith.workshop.arenas.getMakeError()).toBeTruthy();
      await gunsmith.workshop.arenas.pressArenaAction("Walk it");
    });

    then("the saved layout is still playable", async ({gunsmith}) => {
      expect(await gunsmith.arena.getSizeInTiles()).toEqual({width: 12, height: 9});
    });
  });
});

given("the arena generator cannot build the arena asked for, and gives nothing in its place", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.arenas.arrangeSignedInArena();

    await gunsmith.workshop.open();
    await gunsmith.workshop.arenas.open();
    await gunsmith.workshop.pasteThePrompt("two watchtowers and a raised bridge");
    await gunsmith.workshop.make();
  });

  then("the player is told why, in the generator's own reason", async ({gunsmith}) => {
    await expect
      .poll(() => gunsmith.workshop.arenas.getMakeError())
      .toBe(
        "We could not build a playable arena from that request: part of the floor could not be reached from the rest. Ask for a doorway through every wall and stairs up to every raised area.",
      );
  });

  then("no arena is shown as the result", async ({gunsmith}) => {
    await expect.poll(() => gunsmith.workshop.arenas.getMakeError()).not.toBe("");
    expect(await gunsmith.workshop.arenas.hasResult()).toBe(false);
  });
});

given("a signed-in player has a saved arena and no credits", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.workshop.arenas.arrangeSignedInArena("no-credits");

    await gunsmith.workshop.open();
    await gunsmith.workshop.arenas.open();
    await gunsmith.workshop.pasteThePrompt("a wide industrial yard");
    await gunsmith.workshop.make();
    await expect.poll(() => gunsmith.workshop.arenas.getMakeError()).toBe("You’re out of credits.");

    await gunsmith.workshop.arenas.pressArenaAction("Walk it");
  });

  then("the saved arena is still playable", async ({gunsmith}) => {
    expect(await gunsmith.arena.getSizeInTiles()).toEqual({width: 12, height: 9});
  });
});
