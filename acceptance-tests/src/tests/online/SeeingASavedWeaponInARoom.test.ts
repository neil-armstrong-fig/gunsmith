import type {PlayerSnapshot} from "@gunsmith/shared/state-hook/types/PlayerSnapshot";
import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A saved weapon carries its own drawing, which the server sends the other player once while choosing (when both have locked in that slot)
// and both players in the reveal. The local Worker sees no session and refuses saved ids, so the DSL rewrites the frames each browser is given to
// say the first player locked in a saved weapon (the rifle's numbers, a mint drawing) for slot 1: what is proved is what each browser draws
// from what the server says.
const SECONDS_TO_REVEAL = 60;

/** The fewest mint pixels in the HUD's slot 1 that say the saved weapon's drawing is there (no built-in's icon has mint). */
const MINT_PIXELS_OF_THE_DRAWING = 4;

given(
  "a private room whose first player locked in a saved weapon for slot 1, and both have locked in their first weapon",
  () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.room.arrangeASavedWeaponForThisPlayer();
      const code = await gunsmith.room.createPrivateRoom({preRoundSeconds: 60});
      await gunsmith.room.joinWithASecondBrowserToChoose(code);

      await gunsmith.room.preRound.lockInWeapon(1);
      await gunsmith.room.secondBrowser().room.preRound.lockInWeapon(1);
    });

    then(
      "the second player is shown the saved weapon while choosing their second: its own drawing and the numbers it was saved with",
      async ({gunsmith}) => {
        const second = gunsmith.room.secondBrowser();

        const savedWeapon = await second.room.preRound.getOpponentWeaponNumbers(1);
        const rifle = await gunsmith.room.preRound.getOpponentWeaponNumbers(1);

        expect(savedWeapon.name).toBe("Mint Coil");
        expect(await second.room.preRound.getOpponentWeaponPicture(1)).toBe("drawing");
        expect(savedWeapon.stats).toEqual(rifle.stats);
        expect(savedWeapon.rating).toBe(rifle.rating);
        expect(await second.room.preRound.getLockedWeapon(2)).toBeUndefined();
      },
    );

    then("the first player sees their own saved weapon locked in by its name", async ({gunsmith}) => {
      expect(await gunsmith.room.preRound.getLockedWeapon(1)).toBe("Mint Coil");
    });

    when("both lock in their second weapon", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.room.preRound.lockInWeapon(2);
        await gunsmith.room.secondBrowser().room.preRound.lockInWeapon(2);
      });

      then("the second player sees the saved weapon folded to its own drawing and its name", async ({gunsmith}) => {
        const second = gunsmith.room.secondBrowser();

        await second.room.preRound.waitForTheOpponentWeapon(2);

        expect(await second.room.preRound.getOpponentWeapon(1)).toBe("Mint Coil");
        expect(await second.room.preRound.getOpponentWeaponPicture(1)).toBe("drawing");
        expect(await second.room.preRound.isOpponentWeaponShownAsACard(1)).toBe(false);
      });
    });
  },
);

given("a private room whose first player locked in a saved weapon for slot 1, shown the reveal", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.room.arrangeASavedWeaponForThisPlayer();
    const code = await gunsmith.room.createPrivateRoom({revealSeconds: SECONDS_TO_REVEAL, preRoundSeconds: 60});
    await gunsmith.room.joinWithASecondBrowserToChoose(code);
    const second = gunsmith.room.secondBrowser();

    for (const player of [gunsmith, second]) {
      await player.room.preRound.lockInWeapon(1);
      await player.room.preRound.lockInWeapon(2);
      await player.room.preRound.lockInArena();
    }
    await gunsmith.room.preRound.waitForTheReveal();
    await second.room.preRound.waitForTheReveal();
  });

  then(
    "the first player's reveal draws the saved weapon on its own card and the built-ins as before",
    async ({gunsmith}) => {
      expect((await gunsmith.preRound.getReveal()).yours[0]).toBe("Mint Coil");
      expect(await gunsmith.preRound.getRevealPictures()).toEqual({
        yours: ["drawing", "sprite"],
        opponent: ["sprite", "sprite"],
      });
    },
  );

  then("the second player's reveal draws it on the opponent's first card", async ({gunsmith}) => {
    const second = gunsmith.room.secondBrowser();

    expect((await second.preRound.getReveal()).opponent[0]).toBe("Mint Coil");
    expect(await second.preRound.getRevealPictures()).toEqual({
      yours: ["sprite", "sprite"],
      opponent: ["drawing", "sprite"],
    });
  });

  when("both start the match and face each other", () => {
    let firstPose: Pick<PlayerSnapshot, "x" | "y" | "aimDegrees">;

    beforeEach(async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      await gunsmith.room.preRound.askToStartTheMatch();
      await second.room.preRound.askToStartTheMatch();
      await gunsmith.room.waitForTheMatch();
      await second.room.waitForTheMatch();

      const firstPosition = await gunsmith.player.getPosition();

      await gunsmith.player.aimAtTile(await second.player.getPosition());
      await second.player.aimAtTile(firstPosition);
      await expect.poll(() => second.room.hasBeenToldWhereTheOtherPlayerIs()).toBe(true);

      firstPose = {...firstPosition, aimDegrees: await gunsmith.player.getAimDegrees()};
    });

    then("the first player holds the saved weapon's drawing", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.player.hasHeldWeaponAccent("mint")).toBe(true);
    });

    then("the first player's HUD draws it in slot 1", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.hud.getInventory()).selectedName).toBe("Mint Coil");
      await expect
        .poll(async () => (await gunsmith.hud.getInventoryIconLook(1)).mintPixels)
        .toBeGreaterThanOrEqual(MINT_PIXELS_OF_THE_DRAWING);
    });

    then("the second player sees the opponent hold the saved weapon's drawing", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.room.secondBrowser().opponent.hasHeldWeaponAccent("mint", firstPose)).toBe(true);
    });

    then("the second player's own rifle is still drawn as the rifle", async ({gunsmith}) => {
      const second = gunsmith.room.secondBrowser();

      await expect.poll(() => second.player.hasRifleOnScreen()).toBe(true);
      expect(await second.player.hasHeldWeaponAccent("mint")).toBe(false);
    });
  });
});
