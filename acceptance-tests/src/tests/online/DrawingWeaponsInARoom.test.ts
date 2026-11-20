import type {PlayerSnapshot} from "@gunsmith/shared/state-hook/types/PlayerSnapshot";
import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

given("two stationary players in one private room facing each other", () => {
  let secondPose: Pick<PlayerSnapshot, "x" | "y" | "aimDegrees">;

  beforeEach(async ({gunsmith}) => {
    const code = await gunsmith.room.createPrivateRoom();

    await gunsmith.room.joinWithASecondBrowser(code);

    const second = gunsmith.room.secondBrowser();
    const secondPosition = await second.player.getPosition();

    await gunsmith.player.aimAtTile(secondPosition);
    await second.player.aimAtTile(await gunsmith.player.getPosition());
    await expect.poll(() => gunsmith.room.hasBeenToldWhereTheOtherPlayerIs()).toBe(true);

    secondPose = {...secondPosition, aimDegrees: await second.player.getAimDegrees()};
  });

  then("both browsers draw the second player's default rifle", async ({gunsmith}) => {
    await expect.poll(() => gunsmith.room.secondBrowser().player.hasRifleOnScreen()).toBe(true);
    await expect.poll(() => gunsmith.opponent.hasRifleOnScreen(secondPose)).toBe(true);
  });

  when("the second player switches to the marksman rifle", () => {
    beforeEach(async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      await second.player.switchTo(2);
      await second.weapon.waitForSlot(2);
    });

    then("both browsers draw its violet optic in hand", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.room.secondBrowser().player.hasHeldWeaponAccent("violet")).toBe(true);
      await expect.poll(() => gunsmith.opponent.hasHeldWeaponAccent("violet", secondPose)).toBe(true);
    });

    when("the second player switches back", () => {
      beforeEach(async ({gunsmith}) => {
        const second = gunsmith.room.secondBrowser();

        await expect.poll(() => second.player.hasHeldWeaponAccent("violet")).toBe(true);
        await expect.poll(() => gunsmith.opponent.hasHeldWeaponAccent("violet", secondPose)).toBe(true);
        await second.player.switchTo(1);
        await second.weapon.waitForSlot(1);
      });

      then("both browsers draw the default rifle again", async ({gunsmith}) => {
        await expect.poll(() => gunsmith.room.secondBrowser().player.hasRifleOnScreen()).toBe(true);
        await expect.poll(() => gunsmith.opponent.hasRifleOnScreen(secondPose)).toBe(true);
        await expect.poll(() => gunsmith.room.secondBrowser().player.hasHeldWeaponAccent("violet")).toBe(false);
        await expect.poll(() => gunsmith.opponent.hasHeldWeaponAccent("violet", secondPose)).toBe(false);
      });
    });

    when("the first player turns away after seeing the violet optic", () => {
      beforeEach(async ({gunsmith}) => {
        await expect.poll(() => gunsmith.opponent.hasHeldWeaponAccent("violet", secondPose)).toBe(true);

        await gunsmith.player.aimAwayFrom(secondPose);
        await expect.poll(() => gunsmith.room.hasBeenToldWhereTheOtherPlayerIs()).toBe(false);
      });

      then("the server omits the opponent and their optic disappears from the screen", async ({gunsmith}) => {
        expect(gunsmith.room.hasReceivedSnapshots()).toBe(true);
        expect(gunsmith.room.hasBeenToldWhereTheOtherPlayerIs()).toBe(false);
        await expect.poll(() => gunsmith.opponent.hasHeldWeaponAccent("violet", secondPose)).toBe(false);
      });

      when("the first player faces the second again", () => {
        beforeEach(async ({gunsmith}) => {
          await expect.poll(() => gunsmith.opponent.hasHeldWeaponAccent("violet", secondPose)).toBe(false);
          await gunsmith.player.aimAtTile(secondPose);
        });

        then("the opponent returns in the snapshots and their optic is visible again", async ({gunsmith}) => {
          await expect.poll(() => gunsmith.room.hasBeenToldWhereTheOtherPlayerIs()).toBe(true);
          await expect.poll(() => gunsmith.opponent.hasHeldWeaponAccent("violet", secondPose)).toBe(true);
        });
      });
    });
  });
});
