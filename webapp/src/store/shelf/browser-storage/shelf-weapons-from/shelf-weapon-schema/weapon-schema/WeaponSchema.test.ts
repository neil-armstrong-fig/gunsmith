import {STAT_RANGES} from "@gunsmith/engine/power-rating/ranges/StatRanges";
import {MARKSMAN_RIFLE} from "@gunsmith/engine/weapon/weapons/MarksmanRifle";
import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {SUBMACHINE_GUN} from "@gunsmith/engine/weapon/weapons/SubmachineGun";
import {weaponSchema} from "@src/store/shelf/browser-storage/shelf-weapons-from/shelf-weapon-schema/weapon-schema/WeaponSchema";

const STATS = Object.keys(STAT_RANGES) as (keyof typeof STAT_RANGES)[];

it.each([RIFLE, MARKSMAN_RIFLE, SUBMACHINE_GUN])(
  "accepts the built-in $identity.name after a trip through JSON",
  weapon => {
    expect(weaponSchema.parse(JSON.parse(JSON.stringify(weapon)))).toEqual(weapon);
  },
);

it("accepts a weapon with no identity", () => {
  const {identity: _identity, ...bare} = RIFLE;

  expect(weaponSchema.parse(bare)).toEqual(bare);
});

it("keeps only the weapon's own fields", () => {
  expect(weaponSchema.parse({...RIFLE, secret: "x"})).toEqual(RIFLE);
});

it.each([undefined, 12, "rifle", [], [RIFLE]])("refuses %j, which is no weapon", value => {
  expect(weaponSchema.safeParse(value).success).toBe(false);
});

it.each([...STATS, "visionDegrees", "visionRange"])("refuses a weapon with no %s", field => {
  const {[field]: _left, ...rest} = {...RIFLE} as Record<string, unknown>;

  expect(weaponSchema.safeParse(rest).success).toBe(false);
});

describe.each(STATS)("%s", stat => {
  const {min, max} = STAT_RANGES[stat];

  it("accepts the floor and the cap of the engine's range", () => {
    expect(weaponSchema.safeParse({...RIFLE, [stat]: min}).success).toBe(true);
    expect(weaponSchema.safeParse({...RIFLE, [stat]: max}).success).toBe(true);
  });

  it.each([
    ["below the floor", min - 0.01],
    ["above the cap", max + 0.01],
    ["not a number", Number.NaN],
    ["a string", String(min)],
  ])("refuses a value %s", (_why, value) => {
    expect(weaponSchema.safeParse({...RIFLE, [stat]: value}).success).toBe(false);
  });
});

it.each(["magazineSize", "startingReserve"])("refuses a fraction for %s", stat => {
  expect(weaponSchema.safeParse({...RIFLE, [stat]: 10.5}).success).toBe(false);
});

it.each(["visionDegrees", "visionRange"])("refuses %s of nothing, below nothing or without end", stat => {
  expect(weaponSchema.safeParse({...RIFLE, [stat]: 0}).success).toBe(false);
  expect(weaponSchema.safeParse({...RIFLE, [stat]: -1}).success).toBe(false);
  expect(weaponSchema.safeParse({...RIFLE, [stat]: Number.POSITIVE_INFINITY}).success).toBe(false);
});

it.each([12, "rifle", {key: "rifle"}, {name: "Rifle"}, {key: 1, name: "Rifle"}])(
  "refuses an identity of %j",
  identity => {
    expect(weaponSchema.safeParse({...RIFLE, identity}).success).toBe(false);
  },
);
