import type {PickupSnapshot} from "@gunsmith/shared/state-hook/types/PickupSnapshot";
import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const SEED = 8;
const BEHIND_THE_PLAYER = {x: 2.5, y: 6.5};
const WALK_PAST_PICKUP_SECONDS = 0.7;
const OUTLINE = {corners: 4, gaps: 4};
const DRAWINGS = ["lantern", "refused", "placeholder"] as const;

given.each(
  DRAWINGS,
  drawing => `a sparring match with the ${drawing} pickup`,
  drawing => {
    let pickup: PickupSnapshot;

    beforeEach(async ({gunsmith}) => {
      if (drawing === "placeholder") {
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
        await expect.poll(() => gunsmith.pickup.getMarkerOnScreen(pickup)).toMatchObject(OUTLINE);
      });
    });

    if (drawing !== "lantern") return;

    when("the player turns away after seeing the marker", () => {
      beforeEach(async ({gunsmith}) => {
        await expect.poll(() => gunsmith.pickup.getMarkerOnScreen(pickup)).toMatchObject(OUTLINE);
        await gunsmith.player.aimAtTile(BEHIND_THE_PLAYER);
        await expect.poll(async () => (await gunsmith.pickup.get())?.visible).toBe(false);
      });

      then("the entire marker disappears into the fog", async ({gunsmith}) => {
        await expect.poll(async () => (await gunsmith.pickup.getMarkerOnScreen(pickup)).markedPixels).toBe(0);
      });

      when("the player faces the pickup again", () => {
        beforeEach(async ({gunsmith}) => {
          await expect.poll(async () => (await gunsmith.pickup.getMarkerOnScreen(pickup)).markedPixels).toBe(0);
          await gunsmith.player.aimAtTile(pickup);
          await expect.poll(async () => (await gunsmith.pickup.get())?.visible).toBe(true);
        });

        then("the same outline returns", async ({gunsmith}) => {
          await expect.poll(() => gunsmith.pickup.getMarkerOnScreen(pickup)).toMatchObject(OUTLINE);
        });
      });
    });

    when("the player walks over the pickup and looks back at its old location", () => {
      beforeEach(async ({gunsmith}) => {
        await expect.poll(() => gunsmith.pickup.getMarkerOnScreen(pickup)).toMatchObject(OUTLINE);
        await gunsmith.player.walkFor("east", WALK_PAST_PICKUP_SECONDS);
        await gunsmith.pickup.waitUntilTaken();
        await gunsmith.player.aimAtTile(pickup);
      });

      then("the weapon goes into the second slot and leaves no marker on the floor", async ({gunsmith}) => {
        expect(await gunsmith.pickup.get()).toBeUndefined();
        expect(await gunsmith.weapon.get()).toMatchObject({slot: 2, rounds: pickup.magazineSize});
        await expect.poll(async () => (await gunsmith.pickup.getMarkerOnScreen(pickup)).markedPixels).toBe(0);
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

    expect((await gunsmith.pickup.getMarkerOnScreen(pickup)).corners).toBe(0);
    expect((await gunsmith.pickup.getLookOnScreen()).discPixels).toBeGreaterThan(0);
  });
});
