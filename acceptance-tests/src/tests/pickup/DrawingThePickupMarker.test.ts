import type {PickupSnapshot} from "@gunsmith/shared/state-hook/types/PickupSnapshot";
import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const SEED = 8;
// One tile west of the seeded pickup, with the same floor art and lighting.
const CLEAR_FLOOR = {x: 12.5, y: 6.5};
const BEHIND_THE_PLAYER = {x: 2.5, y: 6.5};
const PICKUP_CLEARANCE_TILES = 2;
const WALK_WATCH = {maxSeconds: 2, stepSeconds: 0.1};
const AIM_SETTLE_SECONDS = 0.05;
const OUTLINE = {corners: 4, gaps: 4};
const DRAWINGS = ["lantern", "refused", "built-in SMG"] as const;

given.each(
  DRAWINGS,
  drawing => `a sparring match with the ${drawing} pickup`,
  drawing => {
    let pickup: PickupSnapshot;

    beforeEach(async ({gunsmith}) => {
      if (drawing === "built-in SMG") {
        await gunsmith.startSparringWithSeed(SEED);
      } else {
        await gunsmith.startSparringWithPickupDrawing({seed: SEED, drawing});
      }

      const lying = await gunsmith.pickup.get();
      if (!lying) {
        throw new Error("No weapon lies in the arena.");
      }

      pickup = lying;
      await gunsmith.player.aimAtTile(pickup);
      await expect.poll(async () => (await gunsmith.pickup.get())?.visible).toBe(true);
    });

    when("the player sees the pickup", () => {
      then("the same four clipped corners frame it at the approved size, with open sides", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.pickup.getMarkerOnScreen(pickup, CLEAR_FLOOR)).toMatchObject(OUTLINE);
      });
    });

    if (drawing === "built-in SMG") {
      when("the player sees the authored weapon", () => {
        then("the SMG is drawn with its mint stripe instead of the disc", async ({gunsmith}) => {
          await expect.poll(async () => (await gunsmith.pickup.getLookOnScreen()).mintPixels).toBeGreaterThan(6);
          expect((await gunsmith.pickup.getLookOnScreen()).discPixels).toBe(0);
        });
      });
    }

    if (drawing === "refused") return;

    when("the player turns away after seeing the marker", () => {
      beforeEach(async ({gunsmith}) => {
        await expect.poll(() => gunsmith.pickup.getMarkerOnScreen(pickup, CLEAR_FLOOR)).toMatchObject(OUTLINE);
        await gunsmith.player.aimAtTile(BEHIND_THE_PLAYER);
        await expect.poll(async () => (await gunsmith.pickup.get())?.visible).toBe(false);
      });

      then("the entire marker disappears into the fog", async ({gunsmith}) => {
        await expect
          .poll(async () => (await gunsmith.pickup.getMarkerOnScreen(pickup, CLEAR_FLOOR)).markedPixels)
          .toBe(0);
      });

      when("the player faces the pickup again", () => {
        beforeEach(async ({gunsmith}) => {
          await expect
            .poll(async () => (await gunsmith.pickup.getMarkerOnScreen(pickup, CLEAR_FLOOR)).markedPixels)
            .toBe(0);
          await gunsmith.player.aimAtTile(pickup);
          await expect.poll(async () => (await gunsmith.pickup.get())?.visible).toBe(true);
        });

        then("the same outline returns", async ({gunsmith}) => {
          await expect.poll(() => gunsmith.pickup.getMarkerOnScreen(pickup, CLEAR_FLOOR)).toMatchObject(OUTLINE);
        });
      });
    });

    when("the player walks over the pickup and looks back at its old location", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.holdTheGame();
        expect(await gunsmith.pickup.getMarkerOnScreen(pickup, CLEAR_FLOOR)).toMatchObject(OUTLINE);
        // Leave room for the held weapon outside the marker footprint when facing back.
        await gunsmith.player.walkUntilPast({
          heading: "east",
          limit: pickup.x + PICKUP_CLEARANCE_TILES,
          watch: WALK_WATCH,
        });
        await gunsmith.player.aimAtTile(pickup);
        await gunsmith.runGameFor(AIM_SETTLE_SECONDS);
      });

      if (drawing === "lantern") {
        then("the same lantern core is visible in hand", async ({gunsmith}) => {
          await expect.poll(() => gunsmith.player.hasHeldWeaponAccent("pale")).toBe(true);
        });
      }

      if (drawing === "built-in SMG") {
        then("the same mint SMG stripe is visible in hand", async ({gunsmith}) => {
          await expect.poll(() => gunsmith.player.hasHeldWeaponAccent("mint")).toBe(true);
        });
      }

      then("the weapon goes into the second slot and leaves no marker on the floor", async ({gunsmith}) => {
        expect(await gunsmith.pickup.get()).toBeUndefined();
        expect(await gunsmith.weapon.get()).toMatchObject({slot: 2, rounds: pickup.magazineSize});
        expect((await gunsmith.pickup.getMarkerOnScreen(pickup, CLEAR_FLOOR)).markedPixels).toBe(0);
      });
    });
  },
);

given("a sparring match whose sprite files are missing", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startSparringWithMissingPictures(SEED);
  });

  then("the arena becomes ready and the pickup still draws its placeholder", async ({gunsmith}) => {
    const pickup = await gunsmith.pickup.get();
    if (!pickup) {
      throw new Error("No weapon lies in the arena.");
    }

    expect((await gunsmith.pickup.getMarkerOnScreen(pickup, CLEAR_FLOOR)).corners).toBe(0);
    expect((await gunsmith.pickup.getLookOnScreen()).discPixels).toBeGreaterThan(0);
  });
});
