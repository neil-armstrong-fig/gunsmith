import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// What each seat is told of itself (`docs/match-netcode.md`, principles 2 and 4): its own damage and hits, and the direction and
// loudness of a shot it cannot be told the place of. It reads the events each browser was SENT, the frames on its WebSocket, never what the page plays. In
// a room started on the pinned seed (`addressOfRoom`) the first player stands at (10.5, 10.5) and the second at (9.5, 1.5), so the
// second's shots come from just west of due south of the first: sector 4 of eight, 0 being north and the rest clockwise from it.
const SECTOR_SOUTH = 4;
// They are about nine tiles apart, and a shot carries twenty: the middle third of its range.
const LOUDNESS = "mid";
const SECTOR_NORTH = 0;

given("two browsers are in one private room", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom();

    await gunsmith.room.joinWithASecondBrowser(code);
  });

  when("the second player shoots at the first", () => {
    beforeEach(async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      await second.player.aimAtTile(await gunsmith.player.getPosition());
      await second.player.startFiring();
    });

    then(
      "the first browser is told which way the shots came from, as a direction and a loudness, and nothing else",
      async ({gunsmith}) => {
        await expect
          .poll(() => gunsmith.room.frames.getEventsReceived())
          .toContainEqual({kind: "heard", sound: "shot", sector: SECTOR_SOUTH, loudness: LOUDNESS});
      },
    );

    then("the first browser is told what the shots took off its player", async ({gunsmith}) => {
      await expect
        .poll(() => gunsmith.room.frames.getEventsReceived())
        .toContainEqual({kind: "damageTaken", cause: "bullet", amount: expect.any(Number)});
    });

    then("the second browser is told its shots landed, and told nothing of the first's damage", async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      await expect
        .poll(() => second.room.frames.getEventsReceived())
        .toContainEqual({kind: "hitLanded", on: "opponent"});
      expect(second.room.frames.getEventsReceived().filter(event => isKind(event, "damageTaken"))).toEqual([]);
    });
  });

  when("the first player turns their back on the second, who shoots at them", () => {
    beforeEach(async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      await gunsmith.player.aimAwayFrom(await second.player.getPosition());

      await second.player.aimAtTile(await gunsmith.player.getPosition());
      await second.player.startFiring();
    });

    then(
      "the first browser is told the direction of the shots though it cannot see the shooter",
      async ({gunsmith}) => {
        await expect
          .poll(() => gunsmith.room.frames.getEventsReceived())
          .toContainEqual({kind: "heard", sound: "shot", sector: SECTOR_SOUTH, loudness: LOUDNESS});
        await expect.poll(() => gunsmith.room.frames.hasBeenToldWhereTheOtherPlayerIs()).toBe(false);
      },
    );
  });

  when("each player fires a single shot in turn", () => {
    beforeEach(async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      await gunsmith.player.switchTo(1);
      await gunsmith.clock.waitForGameSeconds(0.2);

      await gunsmith.player.aimAtTile(await second.player.getPosition());
      await gunsmith.player.fire();
      await expect.poll(() => gunsmith.sound.getPlays("sfx-shot")).toHaveLength(1);

      await second.player.aimAtTile(await gunsmith.player.getPosition());
      await second.player.fire();
    });

    then("the first browser plays both its own shot and the shot it heard", async ({gunsmith}) => {
      await expect
        .poll(() => gunsmith.sound.getPlays("sfx-shot"))
        .toMatchObject([
          {contextState: "running", looping: false},
          {contextState: "running", looping: false},
        ]);
    });
  });

  when("the first player moves closer and the second player taps an upright step", () => {
    let previousFootfalls = 0;

    beforeEach(async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      await gunsmith.player.walkFor("south", 0.6);
      await expect.poll(() => gunsmith.sound.getPlays("sfx-footstep")).not.toHaveLength(0);
      await gunsmith.clock.waitForGameSeconds(0.2);
      previousFootfalls = (await gunsmith.sound.getPlays("sfx-footstep")).length;

      await second.player.walkFor("north", 0.06);
    });

    then("the first browser plays the other player's step as well", async ({gunsmith}) => {
      await expect
        .poll(() => gunsmith.room.frames.getEventsReceived())
        .toContainEqual({
          kind: "heard",
          sound: "step",
          sector: expect.any(Number),
          loudness: expect.any(String),
        });
      await expect.poll(() => gunsmith.sound.getPlays("sfx-footstep")).toHaveLength(previousFootfalls + 1);
    });
  });

  when("the first player shoots at the second", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(await gunsmith.room.secondBrowser().player.getPosition());
      await gunsmith.player.startFiring();
    });

    then("the second browser is told the direction of the shots, from its own side", async ({gunsmith}) => {
      await expect
        .poll(() => gunsmith.room.secondBrowser().room.frames.getEventsReceived())
        .toContainEqual({kind: "heard", sound: "shot", sector: SECTOR_NORTH, loudness: LOUDNESS});
    });
  });
});

function isKind(event: unknown, kind: string): boolean {
  return typeof event === "object" && event !== null && Reflect.get(event, "kind") === kind;
}
