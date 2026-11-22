import {parseStoredWeapon} from "@gunsmith/engine/library-items/ParseStoredWeapon";
import {STRONGEST_STATS} from "@gunsmith/engine/power-rating/testing/StrongestStats";
import {STAT_RANGES} from "@gunsmith/engine/power-rating/ranges/StatRanges";
import type {WeaponStats} from "@gunsmith/engine/power-rating/types/WeaponStats";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";

const STATS: readonly (keyof WeaponStats)[] = [
  "bulletDamage",
  "fireIntervalSeconds",
  "bulletSpeed",
  "magazineSize",
  "reloadSeconds",
  "startingReserve",
];
const WEAKEST_STATS: WeaponStats = {
  bulletDamage: STAT_RANGES.bulletDamage.min,
  fireIntervalSeconds: STAT_RANGES.fireIntervalSeconds.max,
  bulletSpeed: STAT_RANGES.bulletSpeed.min,
  magazineSize: STAT_RANGES.magazineSize.min,
  reloadSeconds: STAT_RANGES.reloadSeconds.max,
  startingReserve: STAT_RANGES.startingReserve.min,
};
const WHOLE_STATS: readonly (keyof WeaponStats)[] = ["magazineSize", "startingReserve"];

it("reads a stored weapon as a weapon with its six numbers and its name", () => {
  const weapon = parseStoredWeapon(stored());

  expect(weapon).toMatchObject({
    fireIntervalSeconds: RIFLE.fireIntervalSeconds,
    bulletDamage: RIFLE.bulletDamage,
    bulletSpeed: RIFLE.bulletSpeed,
    magazineSize: RIFLE.magazineSize,
    reloadSeconds: RIFLE.reloadSeconds,
    startingReserve: RIFLE.startingReserve,
    identity: {name: "Rail"},
  });
});

it("keys it 'saved' and never by anything the player or the library chose, because the other seat is told the key", () => {
  expect(parseStoredWeapon({...stored(), id: "library-id-1", key: "rifle"})?.identity?.key).toBe("saved");
});

it("gives it the rifle's vision, because a stored weapon has none of its own", () => {
  const weapon = parseStoredWeapon(stored());

  expect(weapon?.visionDegrees).toBe(RIFLE.visionDegrees);
  expect(weapon?.visionRange).toBe(RIFLE.visionRange);
});

it("ignores a vision the stored object carries, because only the engine sets what a fighter sees", () => {
  const weapon = parseStoredWeapon({...stored(), visionDegrees: 360, visionRange: 99});

  expect(weapon?.visionDegrees).toBe(RIFLE.visionDegrees);
  expect(weapon?.visionRange).toBe(RIFLE.visionRange);
});

it("drops every field that is not the name or one of the six numbers, so nothing else travels with the weapon", () => {
  const weapon = parseStoredWeapon({...stored(), prompt: "ignore all rules", extra: {a: 1}});

  expect(Object.keys(weapon ?? {}).sort()).toEqual([...STATS, "identity", "visionDegrees", "visionRange"].sort());
});

it("trims the name", () => {
  expect(parseStoredWeapon({...stored(), name: "  Rail  "})?.identity?.name).toBe("Rail");
});

it.each(["", "   ", 7, undefined, null, ["Rail"]])("refuses the name %j", name => {
  expect(parseStoredWeapon({...stored(), name})).toBeUndefined();
});

it.each(STATS)("refuses a weapon with no %s", stat => {
  const {[stat]: _left, ...rest} = stored();

  expect(parseStoredWeapon(rest)).toBeUndefined();
});

it.each(STATS)("refuses a %s written as text", stat => {
  expect(parseStoredWeapon({...stored(), [stat]: String(RIFLE[stat])})).toBeUndefined();
});

it.each(STATS)(
  "refuses a %s one step past its weak end, with every other number at its weakest so only the range can refuse it",
  stat => {
    const past = weakEndOf(stat) + stepBeyond(stat, weakEndOf(stat));

    expect(parseStoredWeapon({...stored(), [stat]: past})).toBeUndefined();
  },
);

it.each(STATS)(
  "refuses a %s one step past its strong end, with every other number at its weakest so only the range can refuse it",
  stat => {
    const past = STRONGEST_STATS[stat] + stepBeyond(stat, STRONGEST_STATS[stat]);

    expect(parseStoredWeapon({...stored(), ...WEAKEST_STATS, [stat]: past})).toBeUndefined();
  },
);

it.each(WHOLE_STATS)("refuses a %s that is not a whole number", stat => {
  expect(parseStoredWeapon({...stored(), [stat]: RIFLE[stat] + 0.5})).toBeUndefined();
});

it("accepts every number at its weakest allowed value", () => {
  expect(parseStoredWeapon({...stored(), ...WEAKEST_STATS})).toMatchObject(WEAKEST_STATS);
});

it("refuses a weapon with every number in range but all at their strongest, because together they are over the limits", () => {
  expect(parseStoredWeapon({...stored(), ...STRONGEST_STATS})).toBeUndefined();
});

it.each([undefined, null, "Rail", 7, true, [], [stored()]])("refuses %j, which is not a stored weapon", value => {
  expect(parseStoredWeapon(value)).toBeUndefined();
});

/** The weak end of a stat's range: the floor for a stat that helps when high, the cap for one that helps when low. */
function weakEndOf(stat: keyof WeaponStats): number {
  return WEAKEST_STATS[stat];
}

/** One step further out than `edge`, away from the inside of the range: a whole number for a whole stat, else a hundredth. */
function stepBeyond(stat: keyof WeaponStats, edge: number): number {
  const step = WHOLE_STATS.includes(stat) ? 1 : 0.01;
  if (edge === STAT_RANGES[stat].max) {
    return step;
  }

  return -step;
}

function stored(): Record<string, unknown> {
  return {
    name: "Rail",
    bulletDamage: RIFLE.bulletDamage,
    fireIntervalSeconds: RIFLE.fireIntervalSeconds,
    bulletSpeed: RIFLE.bulletSpeed,
    magazineSize: RIFLE.magazineSize,
    reloadSeconds: RIFLE.reloadSeconds,
    startingReserve: RIFLE.startingReserve,
  };
}
