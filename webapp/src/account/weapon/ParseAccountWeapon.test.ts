import {RIFLE} from "@gunsmith/engine/weapon/weapons/Rifle";
import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import {parseAccountWeapon} from "@src/account/weapon/ParseAccountWeapon";
import {weaponAppearances} from "@src/assets/weapon-drawings/appearances/WeaponAppearances";

it("keeps distinct drawings for weapons that share the saved identity key", () => {
  const appearance = fallbackAppearance();
  const mint = {...appearance, palette: {...appearance.palette, accent: "weapon-mint"}};

  const first = parseAccountWeapon({...RIFLE, name: "Old Coil"}, appearance);
  const second = parseAccountWeapon({...RIFLE, name: "Mint Coil"}, mint);
  if (!first || !second) throw new Error("Could not parse the fixture weapons.");

  expect(first.identity?.key).toBe(second.identity?.key);
  expect(weaponAppearances.get(first)).toEqual(appearance);
  expect(weaponAppearances.get(second)).toEqual(mint);
});
