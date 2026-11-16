import type {PickupSnapshot} from "@gunsmith/shared/state-hook/types/PickupSnapshot";
import {beforeEach, expect, given, then, when} from "@src/acceptance-criteria-mapping/AcceptanceCriteriaMapping";

// A weapon lies in the arena, as far from one fighter as from the other by the way they would walk to it, and the seed draws
// where. Sparring's opponent never moves, so nothing but the player can take it. The fighters start at (10.5, 6.5) and
// (16.5, 6.5), so the weapon lies on the column between them, x = 13.5, and the seed picks the row. Seeds were measured in
// the engine over 0 to 39: seed 8 puts it on the fighters' own row, at (13.5, 6.5), and seed 6 four rows away, at (13.5, 2.5).
const ON_THE_FIGHTERS_ROW_SEED = 8;
const FOUR_ROWS_AWAY_SEED = 6;

// Walking east along the fighters' row for 0.7 s is about four tiles at full speed: from the start past the middle column to
// x = 14.7, with the opponent still two tiles further on.
const WALK_PAST_THE_MIDDLE_SECONDS = 0.7;

// A tile far to the west on the fighters' row: behind the player, who faces east.
const BEHIND_THE_PLAYER = {x: 2.5, y: 6.5};

given("a sparring match whose weapon lies on the row the fighters stand on", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startSparringWithSeed(ON_THE_FIGHTERS_ROW_SEED);
  });

  when("the match has just begun", () => {
    then("a weapon lies in the arena", async ({gunsmith}) => {
      expect(await gunsmith.pickup.get()).toBeDefined();
    });

    then("it lies on the floor, inside the arena", async ({gunsmith}) => {
      const arena = await gunsmith.arena.getSizeInTiles();
      const pickup = await gunsmith.pickup.get();

      expect(pickup?.x).toBeGreaterThan(0);
      expect(pickup?.x).toBeLessThan(arena.width);
      expect(pickup?.y).toBeGreaterThan(0);
      expect(pickup?.y).toBeLessThan(arena.height);
    });

    then("it lies as far from the player as from the opponent, along the row they stand on", async ({gunsmith}) => {
      const player = await gunsmith.player.getPosition();
      const opponent = await gunsmith.opponent.get();
      const pickup = await gunsmith.pickup.get();

      expect(pickup?.x).toBeCloseTo((player.x + opponent.x) / 2, 5);
      expect(pickup?.y).toBeCloseTo(player.y, 5);
    });
  });

  when("the same seed is played again", () => {
    let first: PickupSnapshot | undefined;

    beforeEach(async ({gunsmith}) => {
      first = await gunsmith.pickup.get();

      await gunsmith.startSparringWithSeed(ON_THE_FIGHTERS_ROW_SEED);
    });

    then("the weapon lies in the same place", async ({gunsmith}) => {
      const second = await gunsmith.pickup.get();

      expect(first).toBeDefined();
      expect(second?.x).toBe(first?.x);
      expect(second?.y).toBe(first?.y);
    });
  });

  when("the player walks east, over the weapon", () => {
    let weaponLying: PickupSnapshot | undefined;
    let firstWeaponRounds = 0;
    let firstWeaponReserve = 0;

    beforeEach(async ({gunsmith}) => {
      weaponLying = await gunsmith.pickup.get();
      const carried = await gunsmith.weapon.get();
      firstWeaponRounds = carried.rounds;
      firstWeaponReserve = carried.reserve;

      await gunsmith.player.walkFor("east", WALK_PAST_THE_MIDDLE_SECONDS);
    });

    then("the weapon no longer lies in the arena", async ({gunsmith}) => {
      expect(weaponLying).toBeDefined();
      expect(await gunsmith.pickup.get()).toBeUndefined();
    });

    then("the player holds it, in the second slot, with a full magazine and its reserve", async ({gunsmith}) => {
      const carried = await gunsmith.weapon.get();

      expect(carried.slot).toBe(2);
      expect(carried.rounds).toBe(weaponLying?.magazineSize);
      expect(carried.reserve).toBe(weaponLying?.startingReserve);
    });

    when("the player then switches back to the first weapon", () => {
      beforeEach(async ({gunsmith}) => {
        await gunsmith.player.switchTo(1);
        await gunsmith.weapon.waitForSlot(1);
      });

      then("it is as it was, with its own rounds", async ({gunsmith}) => {
        const carried = await gunsmith.weapon.get();

        expect(carried.rounds).toBe(firstWeaponRounds);
        expect(carried.reserve).toBe(firstWeaponReserve);
      });
    });
  });
});

given("a sparring match whose weapon lies four rows away from the fighters' row", () => {
  beforeEach(async ({gunsmith}) => {
    await gunsmith.startSparringWithSeed(FOUR_ROWS_AWAY_SEED);
  });

  when("the match has just begun", () => {
    then("the seed has put the weapon on another row, still between the fighters", async ({gunsmith}) => {
      const player = await gunsmith.player.getPosition();
      const opponent = await gunsmith.opponent.get();
      const pickup = await gunsmith.pickup.get();

      expect(pickup?.x).toBeCloseTo((player.x + opponent.x) / 2, 5);
      expect(Math.abs((pickup?.y ?? player.y) - player.y)).toBeGreaterThanOrEqual(3);
    });
  });

  when("the player walks east past the middle, along their own row", () => {
    let weaponLying: PickupSnapshot | undefined;
    let carriedBefore = {slot: 0, rounds: 0, reserve: 0};

    beforeEach(async ({gunsmith}) => {
      weaponLying = await gunsmith.pickup.get();
      const carried = await gunsmith.weapon.get();
      carriedBefore = {slot: carried.slot, rounds: carried.rounds, reserve: carried.reserve};

      await gunsmith.player.walkFor("east", WALK_PAST_THE_MIDDLE_SECONDS);
    });

    then("the weapon still lies where it was", async ({gunsmith}) => {
      const pickup = await gunsmith.pickup.get();

      expect(weaponLying).toBeDefined();
      expect(pickup).toBeDefined();
      expect(pickup?.x).toBe(weaponLying?.x);
      expect(pickup?.y).toBe(weaponLying?.y);
    });

    then("the player still holds what they held", async ({gunsmith}) => {
      const carried = await gunsmith.weapon.get();

      expect(carried.slot).toBe(carriedBefore.slot);
      expect(carried.rounds).toBe(carriedBefore.rounds);
      expect(carried.reserve).toBe(carriedBefore.reserve);
    });
  });

  when("the player faces the weapon", () => {
    beforeEach(async ({gunsmith}) => {
      const pickup = await gunsmith.pickup.get();
      if (!pickup) {
        throw new Error("No weapon lies in the arena to face.");
      }

      await gunsmith.player.aimAtTile(pickup);
    });

    then("the player sees it", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.pickup.get())?.visible).toBe(true);
    });
  });

  when("the player faces away from the weapon", () => {
    beforeEach(async ({gunsmith}) => {
      await gunsmith.player.aimAtTile(BEHIND_THE_PLAYER);
    });

    then("the player does not see it, though the game still knows where it lies", async ({gunsmith}) => {
      await expect.poll(async () => (await gunsmith.pickup.get())?.visible).toBe(false);
      expect(await gunsmith.pickup.get()).toBeDefined();
    });
  });
});
