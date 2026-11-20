import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import {weaponPictureUrl} from "@src/assets/weapon-pictures/WeaponPictureUrl";
import type {JSX} from "react";

interface Props {
  weapon: Weapon;
}

/** The weapon's drawing, small and beside its name (so it has no text of its own), or nothing when it has none. */
export function WeaponPicture({weapon}: Props): JSX.Element | undefined {
  const picture = weaponPictureUrl(weapon.identity?.key);
  if (!picture) {
    return undefined;
  }

  return <img src={picture} alt="" width={32} height={32} className="size-8 shrink-0 object-contain" />;
}
