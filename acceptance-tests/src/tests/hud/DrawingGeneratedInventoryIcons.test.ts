import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const FIXTURES = [
  {drawing: "lantern", feature: "palePixels", minimum: 4},
  {drawing: "cactus", feature: "mintPixels", minimum: 8},
  {drawing: "refused", feature: "bluePixels", minimum: 4},
] as const;

given.each(
  FIXTURES,
  ({drawing}) => `a sparring pickup with the ${drawing} drawing`,
  ({drawing, feature, minimum}) => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.startSparringWithPickupDrawing({seed: 8, drawing});
      await gunsmith.player.walkFor("east", 0.7);
      await gunsmith.hud.waitForSlot(2);
    });

    then("the HUD draws the weapon with a readable outline at inventory size", async ({gunsmith}) => {
      const look = await gunsmith.hud.getSecondInventoryIconLook();

      expect(look[feature]).toBeGreaterThanOrEqual(minimum);
      expect(look).toMatchObject({width: 34, height: 34});
      expect(look.outlinePixels).toBeGreaterThanOrEqual(8);
      expect(look.outlineContrast).toBeGreaterThanOrEqual(3);
    });

    when("the player switches back to the rifle", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.switchTo(1);
        await gunsmith.hud.waitForSlot(1);
      });

      then("the same drawing and readable outline stay with the stowed weapon", async ({gunsmith}) => {
        const look = await gunsmith.hud.getSecondInventoryIconLook();

        expect(look[feature]).toBeGreaterThanOrEqual(minimum);
        expect(look.outlinePixels).toBeGreaterThanOrEqual(8);
        expect(look.outlineContrast).toBeGreaterThanOrEqual(3);
      });
    });
  },
);
