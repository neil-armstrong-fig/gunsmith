import {parseStoredWeapon} from "@gunsmith/engine/library-items/ParseStoredWeapon";
import {STRONGEST_STATS} from "@gunsmith/engine/power-rating/testing/StrongestStats";
import {STAT_RANGES} from "@gunsmith/engine/power-rating/ranges/StatRanges";
import type {WeaponStats} from "@gunsmith/engine/power-rating/types/WeaponStats";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";

/** What a stored weapon cannot do without. */
const REQUIRED_STATS: readonly (keyof WeaponStats)[] = [
  "bulletDamage",
  "fireIntervalSeconds",
  "bulletSpeed",
  "magazineSize",
  "reloadSeconds",
  "startingReserve",
];
/** What a weapon stored before vision was a stat leaves out, and a newer one may carry. */
const VISION_STATS: readonly (keyof WeaponStats)[] = ["visionDegrees", "visionRange"];
const STATS: readonly (keyof WeaponStats)[] = [...REQUIRED_STATS, ...VISION_STATS];
/** About 0.65 on every one of the six old stats, which the old shares rated at the budget: 109 damage a second. */
const AT_THE_OLD_BUDGET = {
  bulletDamage: 19.9,
  fireIntervalSeconds: 0.19,
  bulletSpeed: 40.7,
  magazineSize: 14,
  reloadSeconds: 1.12,
  startingReserve: 130,
};
const WEAKEST_STATS: WeaponStats = {
  bulletDamage: STAT_RANGES.bulletDamage.min,
  fireIntervalSeconds: STAT_RANGES.fireIntervalSeconds.max,
  bulletSpeed: STAT_RANGES.bulletSpeed.min,
  magazineSize: STAT_RANGES.magazineSize.min,
  reloadSeconds: STAT_RANGES.reloadSeconds.max,
  startingReserve: STAT_RANGES.startingReserve.min,
  visionDegrees: STAT_RANGES.visionDegrees.min,
  visionRange: STAT_RANGES.visionRange.min,
};
const WHOLE_STATS: readonly (keyof WeaponStats)[] = ["magazineSize", "startingReserve"];

it("reads a stored weapon as a weapon with its numbers and its name", () => {
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

it("gives a weapon stored with no vision the rifle's, so one kept before vision was a stat still plays as it did", () => {
  const weapon = parseStoredWeapon(stored());

  expect(weapon?.visionDegrees).toBe(RIFLE.visionDegrees);
  expect(weapon?.visionRange).toBe(RIFLE.visionRange);
});

it("keeps the vision a stored weapon carries", () => {
  const weapon = parseStoredWeapon({...stored(), visionDegrees: 70, visionRange: 8.5});

  expect(weapon?.visionDegrees).toBe(70);
  expect(weapon?.visionRange).toBe(8.5);
});

it("takes each vision number on its own: one stored and one not gives the one and the rifle's other", () => {
  expect(parseStoredWeapon({...stored(), visionDegrees: 70})).toMatchObject({
    visionDegrees: 70,
    visionRange: RIFLE.visionRange,
  });
  expect(parseStoredWeapon({...stored(), visionRange: 8.5})).toMatchObject({
    visionDegrees: RIFLE.visionDegrees,
    visionRange: 8.5,
  });
});

it("drops every field that is not the name or one of the eight numbers, so nothing else travels with the weapon", () => {
  const weapon = parseStoredWeapon({...stored(), prompt: "ignore all rules", extra: {a: 1}});

  expect(Object.keys(weapon ?? {}).sort()).toEqual([...STATS, "identity"].sort());
});

it("trims the name", () => {
  expect(parseStoredWeapon({...stored(), name: "  Rail  "})?.identity?.name).toBe("Rail");
});

it.each(["", "   ", 7, undefined, null, ["Rail"]])("refuses the name %j", name => {
  expect(parseStoredWeapon({...stored(), name})).toBeUndefined();
});

it.each(REQUIRED_STATS)("refuses a weapon with no %s", stat => {
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

it.each(VISION_STATS)("refuses a %s of null, which is not the same as one left out", stat => {
  expect(parseStoredWeapon({...stored(), [stat]: null})).toBeUndefined();
});

it.each(WHOLE_STATS)("refuses a %s that is not a whole number", stat => {
  expect(parseStoredWeapon({...stored(), [stat]: RIFLE[stat] + 0.5})).toBeUndefined();
});

it("accepts every number at its weakest allowed value", () => {
  expect(parseStoredWeapon({...stored(), ...WEAKEST_STATS})).toMatchObject(WEAKEST_STATS);
});

it("accepts the widest and longest vision with every other number at its weakest", () => {
  const weapon = parseStoredWeapon({...stored(), ...WEAKEST_STATS, visionDegrees: 130, visionRange: 20});

  expect(weapon).toMatchObject({visionDegrees: 130, visionRange: 20});
});

it("still accepts a weapon stored before vision was a stat that was at the old budget, with the rifle's vision", () => {
  expect(parseStoredWeapon({name: "Old", ...AT_THE_OLD_BUDGET})).toMatchObject({
    ...AT_THE_OLD_BUDGET,
    visionDegrees: RIFLE.visionDegrees,
    visionRange: RIFLE.visionRange,
  });
});

it("refuses a weapon that is within the budget until its vision is counted: sight is paid for", () => {
  expect(
    parseStoredWeapon({name: "Greedy", ...AT_THE_OLD_BUDGET, visionDegrees: 130, visionRange: 20}),
  ).toBeUndefined();
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
