import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A generated weapon lies in the arena as the drawing the AI made, not as the mint disc that stood in for it. The canvas is not in the DOM, so this
// reads what a player sees (a screenshot) over the place the game's own state hook says the weapon lies, as `DrawingTheDummies` does for a dummy.
//
// Seams, and what they are not. `?weaponDrawing=lantern` (webapp `game/`) names one of the drawings the webapp ships for this spec and for looking at one:
// art's `top-down-oddities/appearances/jellyfish-cage.json`, drawn at half scale (art's README: a pickup is the body at scale 1 or 0.5; half is 0.71 tile
// across, near today's 0.6-tile disc). `refused` is the same drawing at a version the schema does not know (version 2), so the stand-in is drawn:
// **it ships in the production bundle behind the query**, a test seam like `?ringDelay=`. Nothing links a real weapon to a drawing yet (the engine's
// `Weapon` has no appearance), so a fixture is the only way to ask. The C2 marker has separate coverage in DrawingThePickupMarker.
//
// The cage uses weapon blue and the core uses pale text grey (`#E5EAF0`), sampled centrally to exclude the same colour in the marker. The body grey is the wall's colour and the outline the
// background's, so neither says anything. The drawing is drawn with `toneMapped={false}`, so a flat fill reads exactly.
//
// Measured on a production build, the same every run, over a 33 by 33 grid with a gap of 0.025 tile: the lantern 38 blue and 24 pale grey, the stand-in 6 blue and
// no pale grey, the old mint disc 424. The thresholds sit well away from those. (The stand-in's dark body is close to the dark floor, so only its muzzle is counted: a
// readability note for art, not something this spec can fix.)
const SEED = 8;
// One tile west of the seeded pickup, with the same floor art and lighting.
const CLEAR_FLOOR = {x: 12.5, y: 6.5};
const NONE = 0;
const LANTERN_BLUE_AT_LEAST = 25;
const LANTERN_PALE_AT_LEAST = 15;
const STAND_IN_BLUE_AT_LEAST = 3;
const STAND_IN_BLUE_AT_MOST = 15;

given("a sparring match whose weapon is drawn as art's lantern", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startSparringWithPickupDrawing({seed: SEED, drawing: "lantern"});
  });

  when("the player faces the weapon and sees it", () => {
    beforeEach(async ({gunsmith}) => {
      const pickup = await gunsmith.pickup.get();
      if (!pickup) {
        throw new Error("No weapon lies in the arena to face.");
      }

      await gunsmith.player.aimAtTile(pickup);
      await expect.poll(async () => (await gunsmith.pickup.get())?.visible).toBe(true);
    });

    then("the lantern's cage is drawn in its weapon blue", async ({gunsmith}) => {
      await expect
        .poll(async () => (await gunsmith.pickup.getLookOnScreen()).bluePixels)
        .toBeGreaterThanOrEqual(LANTERN_BLUE_AT_LEAST);
    });

    then("its core is drawn in pale grey, which the stand-in has not", async ({gunsmith}) => {
      await expect
        .poll(async () => (await gunsmith.pickup.getLookOnScreen()).palePixels)
        .toBeGreaterThanOrEqual(LANTERN_PALE_AT_LEAST);
    });

    then("the placeholder disc is gone", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.pickup.getLookOnScreen()).discPixels).toBe(NONE);
    });
  });

  // Compare the whole pickup area against matching floor in the same fog, so even dimmed marks count.
  when("the player faces away from the weapon", () => {
    beforeEach(async ({gunsmith}) => {
      const pickup = await gunsmith.pickup.get();
      const player = await gunsmith.player.getPosition();
      if (!pickup) {
        throw new Error("No weapon lies in the arena to turn away from.");
      }

      await gunsmith.player.aimAtTile({x: player.x + (player.x - pickup.x), y: player.y + (player.y - pickup.y)});
      await expect.poll(async () => (await gunsmith.pickup.get())?.visible).toBe(false);
    });

    then("none of it is drawn, not even dimmed by the fog", async ({gunsmith}) => {
      const pickup = await gunsmith.pickup.get();
      if (!pickup) {
        throw new Error("No weapon lies in the arena to check in the fog.");
      }

      await expect
        .poll(async () => (await gunsmith.pickup.getMarkerOnScreen(pickup, CLEAR_FLOOR)).markedPixels)
        .toBe(NONE);
    });
  });
});

given("a sparring match whose weapon's drawing the game refuses", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startSparringWithPickupDrawing({seed: SEED, drawing: "refused"});
  });

  when("the player faces the weapon and sees it", () => {
    beforeEach(async ({gunsmith}) => {
      const pickup = await gunsmith.pickup.get();
      if (!pickup) {
        throw new Error("No weapon lies in the arena to face.");
      }

      await gunsmith.player.aimAtTile(pickup);
      await expect.poll(async () => (await gunsmith.pickup.get())?.visible).toBe(true);
    });

    then("the game draws its own stand-in, a plain body with a small blue muzzle", async ({gunsmith}) => {
      await expect
        .poll(async () => (await gunsmith.pickup.getLookOnScreen()).bluePixels)
        .toBeGreaterThanOrEqual(STAND_IN_BLUE_AT_LEAST);

      expect((await gunsmith.pickup.getLookOnScreen()).bluePixels).toBeLessThanOrEqual(STAND_IN_BLUE_AT_MOST);
    });

    then("it is not the lantern, which has a pale core, and not the placeholder disc", async ({gunsmith}) => {
      await expect
        .poll(async () => (await gunsmith.pickup.getLookOnScreen()).bluePixels)
        .toBeGreaterThanOrEqual(STAND_IN_BLUE_AT_LEAST);

      const look = await gunsmith.pickup.getLookOnScreen();

      expect(look.palePixels).toBe(NONE);
      expect(look.discPixels).toBe(NONE);
    });
  });
});
