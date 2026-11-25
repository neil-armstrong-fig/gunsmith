import {beforeEach, expect, given, then} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A private room offers five of the built-in arenas each day, the same five to everyone (the user's rotation, 2026-11-24): the
// server works them out from the plays of earlier days, so a room made today offers the same set whoever makes it. Which five they
// are depends on the date, so the criteria say how many and that both players agree, never which. The room gives its players time to
// choose (`preRoundSeconds`), or the match would begin as the second player sits and nobody would be told what to choose from.
given("a private room that gives its players time to choose", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom({preRoundSeconds: 60});

    await gunsmith.room.waitForTheChoosing();
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
});
