import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// What damage looks like: a bracket either side of the player's body for a moment after a bullet hurts them (art's study,
// `docs/art/concepts/combat-feedback/Study.html`), and, for as long as the ring hurts, a red highlight round the player and a red border round the health panel
// (the user's choice; the study's slashes and bottom band were dropped), and, on the health bar, the part a burst of bullets took trailing in amber for
// 350 ms (the ring's loss is a plain bar). The flash is over in 180 ms and the canvas is not in the DOM, so what is round the player is read from a screenshot of
// a game held still on the moment (`holdTheGame`, run in short steps); the panel and bar are DOM, and the bar's slide is noted by a recorder in the page
// (`transitionrun`), so nothing here races a timer.
const TRAIL = "health-trail";
const TRAIL_SECONDS = 0.35;
const AMBER = "rgb(242, 198, 109)";
const CORAL = "rgb(255, 91, 98)";
const BORDER_PIXELS = 2;
// The flash is 0.18 s and opens up to 0.2 tile by its end, so looking at 0.22 s is while a bracket that stayed would still lie in the places looked at.
const FLASH_IS_OVER_SECONDS = 0.22;
const HIT_WATCH = {maxSeconds: 10, stepSeconds: 0.02};

// The ring starts to close after one second and is closed in two more, on a point drawn from the seed. Seed 14 closes on a point one tile from the opponent's
// start, so the player, who stands still in sparring where nothing else can hurt them, is left outside it at about 2.5 s and falls at about 7.6 s (`TakingDamage`).
// A third of the game's own ring (three seconds and six): a held game draws every frame, so what a spec costs follows the game seconds it runs, and at the
// game's own timing the held specs took 30 s on the CI runner, which draws without a graphics card.
const DELAY_SECONDS = 1;
const CLOSING_SECONDS = 2;
const PLAYER_LEFT_OUTSIDE_SEED = 14;
const LONGEST_ROUND_SECONDS = 13.5 + 15;
const RING_HURTS_BY_SECONDS = 15;
const RING_WATCH = {maxSeconds: RING_HURTS_BY_SECONDS, stepSeconds: 0.25};
// The ring's own bright edge passes through the player the moment it first hurts, so the highlight is looked for a second later, when it has moved on.
const RING_EDGE_HAS_MOVED_ON_SECONDS = 1;
const LONGEST_LOSS_SECONDS = 15;

given("a duel has just begun", () => {
  let fullHealth = 0;

  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startDuel();
    fullHealth = await gunsmith.player.getHealth();
  });

  when("the opponent has shot the player", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.waitForHealthBelow(fullHealth);
    });

    then("the health that was lost trails behind the bar for 350 ms", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.hud.getMotions(TRAIL)).length).toBeGreaterThanOrEqual(1);

      const motions = await gunsmith.hud.getMotions(TRAIL);
      expect(motions.map(motion => motion.kind)).toEqual(motions.map(() => "transition"));
      expect(motions.map(motion => motion.durationSeconds)).toEqual(motions.map(() => TRAIL_SECONDS));
    });

    then("the trail is amber, the colour of a warning", async ({gunsmith}) => {
      expect(await gunsmith.hud.getTrailColour()).toBe(AMBER);
    });

    then("the health panel has no red border: a bullet is not the ring", async ({gunsmith}) => {
      expect((await gunsmith.hud.getHealthBorder()).widthPixels).toBe(0);
    });
  });

  when("the player has lost the first round and goes on to the next", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.round.waitForState("lost", LONGEST_LOSS_SECONDS);
      await gunsmith.round.nextRound();
      await gunsmith.round.waitForBannerToGo();

      await gunsmith.hud.waitForHealth(await gunsmith.player.getHealth());
    });

    then("the health bar is full again, and its trail is with it at once, not sliding up", async ({gunsmith}) => {
      expect(await gunsmith.hud.isTrailAtTheBar()).toBe(true);
    });
  });
});

given("a duel, held still, with the player standing in the open", () => {
  beforeEach(async ({gunsmith}) => {
    // The camera shakes for 100 ms after this hit and would move the picture a pixel or two against sampling gaps of about one; `ShakingTheCameraOnAHit` covers the shake.
    gunsmith.scenario.keepTheCameraStill();
    await gunsmith.scenario.startDuel();
    await gunsmith.clock.holdTheGame();
  });

  when("a bullet has just hurt the player", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.runUntilHurt(HIT_WATCH);
    });

    then("a coral bracket stands on each side of the player", async ({gunsmith}) => {
      const damage = await gunsmith.player.getDamageOnScreen();

      expect(damage.leftBracketPoints).toBeGreaterThan(0);
      expect(damage.rightBracketPoints).toBeGreaterThan(0);
    });

    then("nothing rings the player in red: a bullet is not the ring", async ({gunsmith}) => {
      expect((await gunsmith.player.getDamageOnScreen()).highlightPoints).toBe(0);
    });
  });

  when("a bullet has hurt the player and the flash has had time to end", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.runUntilHurt(HIT_WATCH);
      await gunsmith.clock.runGameFor(FLASH_IS_OVER_SECONDS);
    });

    then("no bracket is left on the screen", async ({gunsmith}) => {
      const damage = await gunsmith.player.getDamageOnScreen();

      expect(damage.leftBracketPoints).toBe(0);
      expect(damage.rightBracketPoints).toBe(0);
    });
  });
});

given("a sparring match whose ring closes on the opponent's side of the arena", () => {
  let fullHealth = 0;

  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startClosingRing({
      seed: PLAYER_LEFT_OUTSIDE_SEED,
      delaySeconds: DELAY_SECONDS,
      closingSeconds: CLOSING_SECONDS,
    });
    fullHealth = await gunsmith.player.getHealth();
  });

  when("the ring has begun to take the health of the player, who stands still outside it", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.waitForHealthBelow(fullHealth, RING_HURTS_BY_SECONDS);
    });

    then("the health panel has a red border for as long as the ring hurts", async ({gunsmith}) => {
      await gunsmith.hud.waitForBorder();

      expect(await gunsmith.hud.getHealthBorder()).toEqual({colour: CORAL, widthPixels: BORDER_PIXELS});
    });

    then("the health the ring takes does not trail: the ring's loss is a plain bar", async ({gunsmith}) => {
      await gunsmith.hud.waitForBorder();
      await gunsmith.clock.waitForGameSeconds(1);

      expect(await gunsmith.hud.getMotions(TRAIL)).toHaveLength(0);
    });
  });

  when("the ring has taken all the health of the player", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.round.waitForState("lost", LONGEST_ROUND_SECONDS);
    });

    then("the border is gone, for the round is over", async ({gunsmith}) => {
      await gunsmith.hud.waitForNoBorder();
    });
  });
});

given("a sparring match whose ring closes on the opponent's side of the arena, held still", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.scenario.startClosingRing({
      seed: PLAYER_LEFT_OUTSIDE_SEED,
      delaySeconds: DELAY_SECONDS,
      closingSeconds: CLOSING_SECONDS,
    });
    await gunsmith.clock.holdTheGame();
  });

  when("the ring has been hurting the player, who stands still outside it, for a second", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.runUntilHurt(RING_WATCH);
      await gunsmith.clock.runGameFor(RING_EDGE_HAS_MOVED_ON_SECONDS);
    });

    then("a red highlight rings the player", async ({gunsmith}) => {
      expect((await gunsmith.player.getDamageOnScreen()).highlightPoints).toBeGreaterThan(0);
    });

    then("no bracket stands beside the player: the ring is not a hit", async ({gunsmith}) => {
      const damage = await gunsmith.player.getDamageOnScreen();

      expect(damage.leftBracketPoints).toBe(0);
      expect(damage.rightBracketPoints).toBe(0);
    });
  });
});
