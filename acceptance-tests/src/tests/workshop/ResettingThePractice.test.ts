import type {DummySnapshot} from "@gunsmith/shared/state-hook/types/DummySnapshot";
import type {WeaponSnapshot} from "@gunsmith/shared/state-hook/types/WeaponSnapshot";
import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// The prompt has a `t` in it, the reset key, so typing it is a chance for the key to leak out of the panel.
const FAST_PROMPT = "a fast little submachine gun";

// The rifle's last shot leaves its cooldown running, and a click inside it fires nothing, so the shot from the other weapon waits it out.
const COOLDOWN_SECONDS = 0.5;
const EAST_TILES = 4;

given("the practice range, with a dummy felled and a shot fired from each weapon", () => {
  let dummiesAtStart: DummyAtRest[] = [];
  let felled: DummySnapshot = {x: 0, y: 0, health: 0, visible: false};
  let rifleAtStart: Ammunition = {rounds: 0, reserve: 0};
  let marksmanRifleAtStart: Ammunition = {rounds: 0, reserve: 0};

  beforeEach(async ({gunsmith}) => {
    const start = await gunsmith.player.getPosition();
    const dummies = await gunsmith.dummies.getAll();
    const [first] = dummies;
    if (!first) {
      throw new Error("The practice range has no dummy.");
    }

    dummiesAtStart = dummies.map(dummyAtRest);
    felled = first;
    rifleAtStart = ammunitionOf(await gunsmith.weapon.get());

    await gunsmith.player.switchTo(2);
    await gunsmith.weapon.waitForSlot(2);

    marksmanRifleAtStart = ammunitionOf(await gunsmith.weapon.get());

    await gunsmith.player.switchTo(1);
    await gunsmith.weapon.waitForSlot(1);
    await gunsmith.player.aimAtTile(felled);
    await gunsmith.player.startFiring();
    await gunsmith.dummies.waitForGone(felled);
    await gunsmith.player.stopFiring();

    await gunsmith.player.switchTo(2);
    await gunsmith.weapon.waitForSlot(2);
    await gunsmith.waitForGameSeconds(COOLDOWN_SECONDS);
    // East of the start the middle row is clear to the wall and no dummy stands on it, so this shot cannot meet a dummy that stands up again.
    await gunsmith.player.aimAtTile({x: start.x + EAST_TILES, y: start.y});
    await gunsmith.player.fire();
    await gunsmith.weapon.waitForRounds(marksmanRifleAtStart.rounds - 1);
  });

  when("the player presses the reset key", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.resetTheRange();
    });

    then("every dummy stands again at full health, where it stood", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.dummies.getAll()).map(dummyAtRest)).toEqual(dummiesAtStart);
    });

    then("the weapon in hand has a full magazine and reserve", async ({gunsmith}) => {
      await expect.poll(async () => ammunitionOf(await gunsmith.weapon.get())).toEqual(marksmanRifleAtStart);
    });

    when("the player then switches to the weapon on their back", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.switchTo(1);
        await gunsmith.weapon.waitForSlot(1);
      });

      then("it has a full magazine and reserve too", async ({gunsmith}) => {
        await expect.poll(async () => ammunitionOf(await gunsmith.weapon.get())).toEqual(rifleAtStart);
      });
    });
  });

  when("the player opens the workshop", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.open();
    });

    then("the weapon in hand has a full magazine and reserve, free", async ({gunsmith}) => {
      await expect.poll(async () => ammunitionOf(await gunsmith.weapon.get())).toEqual(marksmanRifleAtStart);
    });

    then("the felled dummy stays down, because opening the workshop does not reset the dummies", async ({gunsmith}) => {
      await expect.poll(() => gunsmith.workshop.isOpen()).toBe(true);

      expect(await gunsmith.dummies.getHealthAt(felled)).toBeUndefined();
    });

    when("the player shuts it and switches to the weapon on their back", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.workshop.close();
        await gunsmith.player.switchTo(1);
        await gunsmith.weapon.waitForSlot(1);
      });

      then("it has a full magazine and reserve too, free", async ({gunsmith}) => {
        await expect.poll(async () => ammunitionOf(await gunsmith.weapon.get())).toEqual(rifleAtStart);
      });
    });
  });

  when("the player types a prompt with a t in it into the workshop", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.open();
      await gunsmith.workshop.typeThePrompt(FAST_PROMPT);
    });

    then("the felled dummy stays down, because the panel keeps the reset key to itself", async ({gunsmith}) => {
      expect(await gunsmith.workshop.getPrompt()).toBe(FAST_PROMPT);
      expect(await gunsmith.dummies.getHealthAt(felled)).toBeUndefined();
    });
  });
});

given("a duel has begun", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startDuel();
  });

  when("the player presses the reset key", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.workshop.resetTheRange();
      await gunsmith.waitForGameSeconds(0.3);
    });

    then("no dummy stands in the arena, because the practice range is the only place with them", async ({gunsmith}) => {
      expect(await gunsmith.dummies.getAll()).toEqual([]);
    });
  });
});

interface DummyAtRest {
  x: number;
  y: number;
  health: number;
}

interface Ammunition {
  rounds: number;
  reserve: number;
}

function dummyAtRest({x, y, health}: DummySnapshot): DummyAtRest {
  return {x, y, health};
}

function ammunitionOf({rounds, reserve}: WeaponSnapshot): Ammunition {
  return {rounds, reserve};
}
