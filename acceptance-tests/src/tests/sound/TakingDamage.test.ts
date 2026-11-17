import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

const DAMAGE_CRUNCH = "sfx-damage-crunch";

// The ring starts to close after three seconds and is closed in six more, on a point drawn from the seed. Seed 14 closes on a point
// one tile from the opponent's start, so the player, who stands still in sparring where nothing else can hurt them, leaves the ring
// at about 7.5 s and falls at about 12.6 s (`TheClosingRing`, measured at a delay of one second plus the two more here).
const DELAY_SECONDS = 3;
const CLOSING_SECONDS = 6;
const PLAYER_LEFT_OUTSIDE_SEED = 14;
const LONGEST_ROUND_SECONDS = 13.5 + 15;

given("a duel has just begun", () => {
  let fullHealth = 0;

  beforeEach(async ({gunsmith}) => {
    await gunsmith.startDuel();
    fullHealth = await gunsmith.player.getHealth();
  });

  when("the opponent has shot the player", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.waitForHealthBelow(fullHealth);
    });

    then("the damage crunches, and the audio is running when it does", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.sound.getPlays(DAMAGE_CRUNCH)).length).toBeGreaterThanOrEqual(1);

      const plays = await gunsmith.sound.getPlays(DAMAGE_CRUNCH);
      expect(plays.map(play => play.contextState)).toEqual(plays.map(() => "running"));
      expect(plays.map(play => new URL(play.url).pathname)).toEqual(
        plays.map(() => expect.stringMatching(/\/sfx-damage-crunch[^/]*\.mp3$/)),
      );
    });
  });

  when("the sound is muted and the opponent has shot the player again", () => {
    let playsWhenMuted = 0;

    beforeEach(async ({gunsmith}) => {
      await gunsmith.sound.toggleMute();
      // The opponent may have landed its first hit before the key was pressed: only what comes after counts.
      playsWhenMuted = (await gunsmith.sound.getPlays(DAMAGE_CRUNCH)).length;
      await gunsmith.player.waitForHealthBelow(await gunsmith.player.getHealth());
    });

    then("nothing more crunches", async ({gunsmith}) => {
      await gunsmith.waitForGameSeconds(1);

      expect(await gunsmith.sound.getPlays(DAMAGE_CRUNCH)).toHaveLength(playsWhenMuted);
    });
  });
});

given("a sparring match has just begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startSparring();
  });

  when("the player has shot the opponent", () => {
    beforeEach(async ({gunsmith}) => {
      const opponent = await gunsmith.opponent.get();

      await gunsmith.player.aimAtTile(opponent);
      await gunsmith.player.fire();
      await gunsmith.opponent.waitForHealthBelow(opponent.health);
    });

    then("nothing crunches, for the player took no damage", async ({gunsmith}) => {
      await gunsmith.waitForGameSeconds(1);

      expect(await gunsmith.sound.getPlays(DAMAGE_CRUNCH)).toHaveLength(0);
    });
  });
});

given("a sparring match whose ring closes on the opponent's side of the arena", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startClosingRing({
      seed: PLAYER_LEFT_OUTSIDE_SEED,
      delaySeconds: DELAY_SECONDS,
      closingSeconds: CLOSING_SECONDS,
    });
  });

  when("the ring has taken all the health of the player, who stood still outside it", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.round.waitForState("lost", LONGEST_ROUND_SECONDS);
    });

    then("the ring crunched once when it began to hurt, not for each step it went on hurting", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.sound.getPlays(DAMAGE_CRUNCH)).length).toBe(1);

      expect((await gunsmith.sound.getPlays(DAMAGE_CRUNCH)).map(play => play.contextState)).toEqual(["running"]);
    });

    then("nothing crunches once the round is lost", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.sound.getPlays(DAMAGE_CRUNCH)).length).toBe(1);
      await gunsmith.waitForGameSeconds(1);

      expect(await gunsmith.sound.getPlays(DAMAGE_CRUNCH)).toHaveLength(1);
    });
  });
});
