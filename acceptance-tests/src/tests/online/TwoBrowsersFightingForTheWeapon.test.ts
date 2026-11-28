import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A weapon lies in the arena for the two fighters to race for, as it does in a duel against the opponent: the server places it as near as can
// be to equally far from both by the way they would walk, and tells a seat of it only while that seat sees it (fog, like a fighter). The room is
// started from seed 131, where the first player stands at (4.5, 5.5), the second at (15.5, 6.5) and the weapon lies at (10.5, 5.5): on the
// first player's own row, six tiles east and nothing between, so one held key walks onto it. The second player hears the weapon taken
// from its direction and band alone: west and a little south of them, sector 6 of eight (0 north, clockwise), and about five tiles away, so
// the middle third of its twelve-tile hearing.
const SEED_WITH_THE_WEAPON_ON_A_ROW = 131;
const SECTOR_WEST = 6;
const LOUDNESS = "mid";

given("two browsers are in one private room, started where the weapon lies on the first player's row", () => {
  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom({startSeed: SEED_WITH_THE_WEAPON_ON_A_ROW});

    await gunsmith.room.joinWithASecondBrowser(code);
    await expect.poll(() => gunsmith.room.frames.hasReceivedSnapshots()).toBe(true);
  });

  then("the first player is told where the weapon lies while they face it", async ({gunsmith}) => {
    await expect.poll(() => gunsmith.room.frames.hasBeenToldWhereTheWeaponLies()).toBe(true);
    expect(await gunsmith.pickup.get()).toMatchObject({x: 10.5, y: 5.5});
  });

  when("the first player turns their back on the weapon", () => {
    beforeEach(async ({gunsmith}) => {
      await expect.poll(() => gunsmith.room.frames.hasBeenToldWhereTheWeaponLies()).toBe(true);
      await gunsmith.player.aimAwayFrom({x: 10.5, y: 5.5});
    });

    then("the first player is told nothing of where it lies", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.room.frames.hasBeenToldWhereTheWeaponLies()).toBe(false);
      expect(gunsmith.room.frames.hasReceivedSnapshots()).toBe(true);
    });
  });

  when("the first player walks east onto the weapon", () => {
    beforeEach(async ({gunsmith}) => {
      await expect.poll(() => gunsmith.room.frames.hasBeenToldWhereTheWeaponLies()).toBe(true);

      await gunsmith.player.startWalking("east");
      await gunsmith.pickup.waitUntilTaken(30);
      await gunsmith.player.stopWalking("east");
    });

    then("the first browser is told it took the weapon", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.room.frames.getEventsReceived()).toContainEqual({kind: "pickupTaken"});
    });

    then("the second browser hears it taken, as a direction and a loudness and nothing else", async ({gunsmith}) => {
      await expect
        .poll(() => gunsmith.room.secondBrowser().room.frames.getEventsReceived())
        .toContainEqual({kind: "heard", sound: "pickup", sector: SECTOR_WEST, loudness: LOUDNESS});
    });

    then("the weapon no longer lies in the arena for either of them", async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      await expect.poll(() => gunsmith.room.frames.hasBeenToldWhereTheWeaponLies()).toBe(false);
      await expect.poll(() => second.room.frames.hasBeenToldWhereTheWeaponLies()).toBe(false);
    });
  });
});
