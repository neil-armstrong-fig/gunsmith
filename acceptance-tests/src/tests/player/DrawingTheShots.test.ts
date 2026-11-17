import type {BulletSnapshot} from "@gunsmith/shared/state-hook/types/BulletSnapshot";
import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A shot is drawn on the canvas, which is not in the DOM, and it is in the air for a fraction of a second, so this spec holds the game still on one
// (`gunsmith.holdTheGame()`, then runs it a step at a time) and reads what a player sees (a screenshot) over the places the state hook says the bullet is,
// flying which way and whose it is, as `DrawingThePlayer` does for the player. It looks for art's picture of the rifle's shot (`docs/art/asset-reference/effects/projectile-rifle/`):
// a thin bar of one flat colour, its tip on the bullet's point, in the shooter's team colour: blue for the player and orange for the opponent. The placeholder
// it replaces was a small gold disc, which has no length at all.
const ALL_ALONG_PLACES = 6;
const SOME_PLACEHOLDER_PLACES = 3;
const GAME_SECONDS_AFTER_AIMING = 0.05;
const GAME_SECONDS_IN_FLIGHT = 0.1;
const MOST_GAME_SECONDS_FOR_THE_OPPONENT_TO_FIRE = 10;
const GAME_SECONDS_AFTER_TURNING_AWAY = 0.03;

given("a sparring match, held still, with the player aiming east at the opponent a few tiles away", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startSparring();
    await gunsmith.holdTheGame();
  });

  when("the player fires and the shot has been in the air for a moment", () => {
    let shot: BulletSnapshot;

    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile({x: 15.5, y: 6.5});
      await gunsmith.runGameFor(GAME_SECONDS_AFTER_AIMING);
      await gunsmith.player.fire();
      await gunsmith.runGameFor(GAME_SECONDS_IN_FLIGHT);
      const [first] = await gunsmith.bullets.getAll();
      if (!first) {
        throw new Error("The player fired and no shot is in the air.");
      }

      shot = first;
    });

    then("the shot is a bar in the team's blue, lying along its flight", async ({gunsmith}) => {
      expect((await gunsmith.bullets.getLookOnScreen(shot)).alongPoints).toBe(ALL_ALONG_PLACES);
    });

    then("the bar is thin: nothing beside it is drawn", async ({gunsmith}) => {
      expect((await gunsmith.bullets.getLookOnScreen(shot)).acrossPoints).toBe(0);
    });

    then("the bar's tip is on the bullet, with nothing drawn ahead of it", async ({gunsmith}) => {
      expect((await gunsmith.bullets.getLookOnScreen(shot)).aheadPoints).toBe(0);
    });

    then("the bar has an end: nothing is drawn past its tail", async ({gunsmith}) => {
      expect((await gunsmith.bullets.getLookOnScreen(shot)).beyondTailPoints).toBe(0);
    });

    then("the stand-in disc is gone once the picture is there", async ({gunsmith}) => {
      expect((await gunsmith.bullets.getLookOnScreen(shot)).placeholderPoints).toBe(0);
    });

    then("none of it is the opponent's orange", async ({gunsmith}) => {
      expect((await gunsmith.bullets.getLookOnScreen(shot)).otherTeamAlongPoints).toBe(0);
    });
  });

  // The picture faces east at rest and the game turns it to the way the bullet flies: a bar along its flight, the tip first, whichever way that is.
  when.each(
    [
      {way: "north", tile: {x: 10.5, y: 11.5}},
      {way: "west", tile: {x: 2.5, y: 6.5}},
      {way: "south", tile: {x: 10.5, y: 1.5}},
      {way: "north-east", tile: {x: 15.5, y: 11.5}},
    ],
    ({way}) => `the player fires ${way} and the shot has been in the air for a moment`,
    ({tile}) => {
      let shot: BulletSnapshot;

      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.aimAtTile(tile);
        await gunsmith.runGameFor(GAME_SECONDS_AFTER_AIMING);
        await gunsmith.player.fire();
        await gunsmith.runGameFor(GAME_SECONDS_IN_FLIGHT);
        const [first] = await gunsmith.bullets.getAll();
        if (!first) {
          throw new Error("The player fired and no shot is in the air.");
        }

        shot = first;
      });

      then("the shot is a bar lying along its flight, with its tip on the bullet", async ({gunsmith}) => {
        const look = await gunsmith.bullets.getLookOnScreen(shot);

        expect(look.alongPoints).toBe(ALL_ALONG_PLACES);
        expect(look.aheadPoints).toBe(0);
        expect(look.acrossPoints).toBe(0);
      });
    },
  );
});

given("a duel, held still, in which the opponent has fired at the player", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startDuel();
    await gunsmith.holdTheGame();
    await gunsmith.bullets.runUntilTheOpponentFires(MOST_GAME_SECONDS_FOR_THE_OPPONENT_TO_FIRE);
  });

  when("the player sees the shot, which has flown clear of the opponent's body", () => {
    let shot: BulletSnapshot;

    beforeEach(async ({gunsmith}) => {
      const [first] = (await gunsmith.bullets.getAll()).filter(bullet => bullet.shooter === "opponent");
      if (!first) {
        throw new Error("The opponent fired and no shot of its is in the air.");
      }

      shot = first;
    });

    then("it is a bar in the opponent's orange, not the player's blue, lying along its flight", async ({gunsmith}) => {
      const look = await gunsmith.bullets.getLookOnScreen(shot);

      expect(look.alongPoints).toBe(ALL_ALONG_PLACES);
      expect(look.otherTeamAlongPoints).toBe(0);
    });

    then("its tip is on the bullet, as the player's is", async ({gunsmith}) => {
      const look = await gunsmith.bullets.getLookOnScreen(shot);

      expect(look.aheadPoints).toBe(0);
      expect(look.beyondTailPoints).toBe(0);
    });
  });

  // Fog: a shot outside what the player sees is not drawn at all, so a hidden opponent's fire gives its place away to nobody.
  when("the player turns away, so the shot is outside what they see", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile({x: 10.5, y: 1.5});
      await gunsmith.runGameFor(GAME_SECONDS_AFTER_TURNING_AWAY);
    });

    then("the shot is still in the air", async ({gunsmith}) => {
      expect((await gunsmith.bullets.getAll()).some(bullet => bullet.shooter === "opponent")).toBe(true);
    });

    then("none of it is drawn", async ({gunsmith}) => {
      const [stillFlying] = (await gunsmith.bullets.getAll()).filter(bullet => bullet.shooter === "opponent");
      if (!stillFlying) {
        throw new Error("The opponent's shot is gone.");
      }

      const look = await gunsmith.bullets.getLookOnScreen(stillFlying);

      expect(look.alongPoints).toBe(0);
      expect(look.placeholderPoints).toBe(0);
    });
  });
});

given("a sparring match, held still, whose pictures are not on the server", () => {
  let shot: BulletSnapshot;

  beforeEach(async ({gunsmith}) => {
    await gunsmith.startSparringWithMissingPictures();
    await gunsmith.holdTheGame();
    await gunsmith.player.aimAtTile({x: 10.5, y: 11.5});
    await gunsmith.runGameFor(GAME_SECONDS_AFTER_AIMING);
    await gunsmith.player.fire();
    await gunsmith.runGameFor(GAME_SECONDS_IN_FLIGHT);
    const [first] = await gunsmith.bullets.getAll();
    if (!first) {
      throw new Error("The player fired and no shot is in the air.");
    }

    shot = first;
  });

  when("the player fires", () => {
    then("the shot is the stand-in disc, so it is still seen", async ({gunsmith}) => {
      expect((await gunsmith.bullets.getLookOnScreen(shot)).placeholderPoints).toBeGreaterThanOrEqual(
        SOME_PLACEHOLDER_PLACES,
      );
    });

    then("no bar is drawn", async ({gunsmith}) => {
      expect((await gunsmith.bullets.getLookOnScreen(shot)).alongPoints).toBe(0);
    });
  });
});
