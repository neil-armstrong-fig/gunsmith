import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const RIFLE_ICON = "/assets/ui/ui-weapon-rifle.svg";
const MARKSMAN_RIFLE_ICON = "/assets/ui/ui-weapon-marksman-rifle.svg";
const SUBMACHINE_GUN_ICON = "/assets/ui/ui-weapon-submachine-gun.svg";

given("a sparring match whose pickup is on the fighters' row", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startSparringWithSeed(8);
  });

  then("the HUD draws both starting weapons and names the selected rifle", async ({gunsmith}) => {
    expect(await gunsmith.hud.getInventory()).toMatchObject({
      selectedName: "Rifle",
      firstIcon: RIFLE_ICON,
      secondIcon: MARKSMAN_RIFLE_ICON,
      firstSelected: true,
      secondSelected: false,
    });
  });

  when("the player switches to slot 2", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.switchTo(2);
      await gunsmith.hud.waitForSlot(2);
    });

    then("the HUD selects and names the marksman rifle, keeping both icons in place", async ({gunsmith}) => {
      expect(await gunsmith.hud.getInventory()).toMatchObject({
        selectedName: "Marksman rifle",
        firstIcon: RIFLE_ICON,
        secondIcon: MARKSMAN_RIFLE_ICON,
        firstSelected: false,
        secondSelected: true,
      });
    });
  });

  when("the player takes the pickup", () => {
    let startingWidth = 0;

    beforeEach(async ({gunsmith}) => {
      startingWidth = (await gunsmith.hud.getInventory()).widthPixels;
      await gunsmith.player.walkFor("east", 0.7);
      await gunsmith.hud.waitForSlot(2);
    });

    then("the second icon and name become the submachine gun without widening the HUD", async ({gunsmith}) => {
      expect(await gunsmith.hud.getInventory()).toEqual({
        selectedName: "Submachine gun",
        firstIcon: RIFLE_ICON,
        secondIcon: SUBMACHINE_GUN_ICON,
        firstSelected: false,
        secondSelected: true,
        widthPixels: startingWidth,
      });
    });

    when("the player switches back to slot 1", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.switchTo(1);
        await gunsmith.hud.waitForSlot(1);
      });

      then("the HUD keeps the pickup visible while the rifle is in hand", async ({gunsmith}) => {
        expect(await gunsmith.hud.getInventory()).toMatchObject({
          selectedName: "Rifle",
          firstIcon: RIFLE_ICON,
          secondIcon: SUBMACHINE_GUN_ICON,
          firstSelected: true,
          secondSelected: false,
        });
      });
    });
  });
});
