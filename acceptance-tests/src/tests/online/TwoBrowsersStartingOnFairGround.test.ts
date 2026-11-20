import {beforeEach, expect, given, then} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A room's two fighters start on a matching pair of places, chosen by the server from a seed (the page pins one, `?startSeed=`, so a spec
// does not depend on a draw): each where the other would be if the arena were turned half way round, so on world points the two add up
// to the arena's width and height. Neither player has asked for anything, so each stands where they began. The pair is at least 10
// steps apart on foot, and a step is at most one tile along either axis: 10 / sqrt(2) in a straight line.
const NEAREST_THE_FIGHTERS_START = 7;

given("two browsers are in one private room that has just begun", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom();

    await gunsmith.room.joinWithASecondBrowser(code);
  });

  then("each player stands where the other would if the arena were turned half way round", async ({gunsmith}) => {
    const first = await gunsmith.player.getPosition();
    const second = await gunsmith.room.secondBrowser().player.getPosition();
    const arena = await gunsmith.arena.getSizeInTiles();

    expect(first.x + second.x).toBe(arena.width);
    expect(first.y + second.y).toBe(arena.height);
  });

  then("the two players start well apart, not in each other's face", async ({gunsmith}) => {
    const first = await gunsmith.player.getPosition();
    const second = await gunsmith.room.secondBrowser().player.getPosition();

    expect(Math.hypot(first.x - second.x, first.y - second.y)).toBeGreaterThanOrEqual(NEAREST_THE_FIGHTERS_START);
  });
});
