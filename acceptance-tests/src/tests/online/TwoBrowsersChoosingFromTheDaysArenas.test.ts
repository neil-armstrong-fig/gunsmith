import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A private room offers five of the built-in arenas each day, the same five to everyone (the user's rotation, 2026-11-24): the
// server works them out from the plays of earlier days, so a room made today offers the same set whoever makes it. Which five they
// are depends on the date, so the criteria say how many, that both players agree and that the screen offers those, never which. The
// room gives its players time to choose (`preRoundSeconds`), or the match would begin as the second player sits and nobody would be
// told what to choose from, and it is one that keeps to the day's arenas (`daysArenas`), as a real room does.
given("a private room that gives its players time to choose", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom({preRoundSeconds: 60, daysArenas: true});

    await gunsmith.room.preRound.waitToBeChoosing();
    await gunsmith.room.joinWithASecondBrowserToChoose(code);
  });

  then("the room offers five different built-in arenas", async ({gunsmith}) => {
    const offered = gunsmith.room.getArenasOffered() ?? [];

    expect(offered).toHaveLength(5);
    expect(new Set(offered).size).toBe(5);
  });

  then("the second player is offered the same five", async ({gunsmith}) => {
    expect(gunsmith.room.secondBrowser().room.getArenasOffered()).toEqual(gunsmith.room.getArenasOffered());
  });

  when("the first player has locked in both weapons and comes to the arena", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.room.preRound.lockInWeapon(1);
      await gunsmith.room.preRound.lockInWeapon(2);
    });

    then("the screen offers exactly the room's five, in the room's order, and nothing else", async ({gunsmith}) => {
      const offered = gunsmith.room.getArenasOffered();

      await expect.poll(() => gunsmith.preRound.arena.getChoices()).toEqual(offered);
    });

    then("the first of the five is chosen to begin with", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.preRound.arena.getChoices()).toHaveLength(5);
      expect(await gunsmith.preRound.arena.getChosen()).toBe(gunsmith.room.getArenasOffered()?.[0]);
    });
  });
});

// Every other spec's room offers every built-in arena instead (`?arenaRotation=off`), so that a room with no time to choose is on the Duel
// whatever the date; this says the seam reaches the room.
given("a private room made for a spec that is not about the day's arenas", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.room.createPrivateRoom({preRoundSeconds: 60});
    await gunsmith.room.preRound.waitToBeChoosing();
  });

  then("the room offers every built-in arena, more than the day's five, the Duel first", async ({gunsmith}) => {
    const offered = gunsmith.room.getArenasOffered() ?? [];

    expect(offered.length).toBeGreaterThan(5);
    expect(offered[0]).toBe("Duel");
  });
});
