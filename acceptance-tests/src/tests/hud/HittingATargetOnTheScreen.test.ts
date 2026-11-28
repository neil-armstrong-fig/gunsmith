import type {DummySnapshot} from "@gunsmith/shared/state-hook/types/DummySnapshot";
import type {OpponentSnapshot} from "@gunsmith/shared/state-hook/types/OpponentSnapshot";
import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// What a hit landed looks like: four mint ticks at the corners of the target the player's bullet has just hit (art's study,
// `docs/art/concepts/combat-feedback/Study.html`, "OUTGOING HIT"), for 180 ms, and only while the player can see that target. The engine reports a hit only on a
// target the player sees (it carries no place: `hitLanded`), and the screen draws the ticks only while the place is still in sight, so a target the player has turned
// away from gives nothing away. The flash is over in 180 ms and the canvas is not in the DOM, so what is round a target is read from a screenshot of a game held
// still on the moment (`holdTheGame`, run in short steps), as `TakingDamageOnTheScreen` does for the player's own damage.
const ALL_CORNERS = 4;
const HIT_WATCH = {maxSeconds: 5, stepSeconds: 0.02};
const GAME_SECONDS_AFTER_AIMING = 0.05;
// A rifle bullet takes a few tenths of a second to reach a target six tiles away: this long after the shot it is in the air, not yet landed.
const GAME_SECONDS_AFTER_FIRING = 0.03;
const GAME_SECONDS_AFTER_TURNING_AWAY = 0.04;
// The ticks last 0.18 s: looking at 0.22 s is after a tick that stayed would have ended.
const FLASH_IS_OVER_SECONDS = 0.22;
const TILES_TO_TURN_AWAY = 4;

given("a sparring match, held still, with the player aiming at the opponent a few tiles away", () => {
  let opponent: OpponentSnapshot;

  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startSparring();
    await gunsmith.clock.holdTheGame();
    opponent = await gunsmith.opponent.get();

    await gunsmith.player.aimAtTile(opponent);
    await gunsmith.clock.runGameFor(GAME_SECONDS_AFTER_AIMING);
  });

  when("the player's bullet has just landed on the opponent", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.fire();
      await gunsmith.opponent.runUntilHurt(HIT_WATCH);
    });

    then("a mint tick stands at each corner of the opponent", async ({gunsmith}) => {
      expect((await gunsmith.opponent.getHitOnScreen()).cornersWithTicks).toBe(ALL_CORNERS);
    });

    then("none stands round the player: a hit landed is not damage taken", async ({gunsmith}) => {
      expect((await gunsmith.player.getHitOnScreen()).cornersWithTicks).toBe(0);
    });

    then("the player has no coral bracket, for nothing hurt them", async ({gunsmith}) => {
      const damage = await gunsmith.player.getDamageOnScreen();

      expect(damage.leftBracketPoints).toBe(0);
      expect(damage.rightBracketPoints).toBe(0);
    });
  });

  when("the player's bullet has landed and the flash has had time to end", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.fire();
      await gunsmith.opponent.runUntilHurt(HIT_WATCH);
      await gunsmith.clock.runGameFor(FLASH_IS_OVER_SECONDS);
    });

    then("no tick is left on the screen", async ({gunsmith}) => {
      expect((await gunsmith.opponent.getHitOnScreen()).cornersWithTicks).toBe(0);
    });
  });

  when("the player has fired and turns away before the bullet lands, so the opponent is hurt out of sight", () => {
    beforeEach(async ({gunsmith}) => {
      const player = await gunsmith.player.getPosition();

      await gunsmith.player.fire();
      await gunsmith.clock.runGameFor(GAME_SECONDS_AFTER_FIRING);
      await gunsmith.player.aimAtTile({x: player.x - TILES_TO_TURN_AWAY, y: player.y});
      await gunsmith.opponent.runUntilHurt(HIT_WATCH);
    });

    then("the opponent is hurt and cannot be seen", async ({gunsmith}) => {
      const hurt = await gunsmith.opponent.get();

      expect(hurt.health).toBeLessThan(opponent.health);
      expect(hurt.visible).toBe(false);
    });

    then(
      "no tick is drawn where it stands, for the screen must not say a hit landed on what the player cannot see",
      async ({gunsmith}) => {
        expect((await gunsmith.opponent.getHitOnScreen()).cornersWithTicks).toBe(0);
      },
    );
  });

  when("the player's bullet has landed and the player turns away while the ticks are still showing", () => {
    beforeEach(async ({gunsmith}) => {
      const player = await gunsmith.player.getPosition();

      await gunsmith.player.fire();
      await gunsmith.opponent.runUntilHurt(HIT_WATCH);
      await gunsmith.player.aimAtTile({x: player.x - TILES_TO_TURN_AWAY, y: player.y});
      await gunsmith.clock.runGameFor(GAME_SECONDS_AFTER_TURNING_AWAY);
    });

    then("the opponent is out of sight", async ({gunsmith}) => {
      expect((await gunsmith.opponent.get()).visible).toBe(false);
    });

    then("the ticks go with its place: none is left where a hidden opponent stands", async ({gunsmith}) => {
      expect((await gunsmith.opponent.getHitOnScreen()).cornersWithTicks).toBe(0);
    });
  });
});

given("a match, held still, with the player aiming at a practice dummy", () => {
  let dummy: DummySnapshot;
  let another: DummySnapshot;

  beforeEach(async ({gunsmith}) => {
    await gunsmith.clock.holdTheGame();
    const [first, second] = await gunsmith.dummies.getAll();
    if (!first || !second) {
      throw new Error("The practice range has fewer than two dummies.");
    }

    dummy = first;
    another = second;
    await gunsmith.player.aimAtTile(dummy);
    await gunsmith.clock.runGameFor(GAME_SECONDS_AFTER_AIMING);
    expect(await gunsmith.dummies.isSeenAt(dummy)).toBe(true);
  });

  when("the player's bullet has just landed on the dummy", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.fire();
      await gunsmith.dummies.runUntilHurt(dummy, HIT_WATCH);
    });

    then("a mint tick stands at each corner of that dummy", async ({gunsmith}) => {
      expect((await gunsmith.dummies.getHitOnScreen(dummy)).cornersWithTicks).toBe(ALL_CORNERS);
    });

    then("none stands at another dummy", async ({gunsmith}) => {
      expect((await gunsmith.dummies.getHitOnScreen(another)).cornersWithTicks).toBe(0);
    });
  });

  when("the player has fired and turns away before the bullet lands", () => {
    beforeEach(async ({gunsmith}) => {
      const player = await gunsmith.player.getPosition();

      await gunsmith.player.fire();
      await gunsmith.clock.runGameFor(GAME_SECONDS_AFTER_FIRING);
      await gunsmith.player.aimAtTile({x: player.x - TILES_TO_TURN_AWAY, y: player.y});
      await gunsmith.dummies.runUntilHurt(dummy, HIT_WATCH);
    });

    then("the dummy is hurt and cannot be seen", async ({gunsmith}) => {
      expect(await gunsmith.dummies.getHealthAt(dummy)).toBeLessThan(dummy.health);
      expect(await gunsmith.dummies.isSeenAt(dummy)).toBe(false);
    });

    then("no tick is drawn where it stands", async ({gunsmith}) => {
      expect((await gunsmith.dummies.getHitOnScreen(dummy)).cornersWithTicks).toBe(0);
    });
  });
});
