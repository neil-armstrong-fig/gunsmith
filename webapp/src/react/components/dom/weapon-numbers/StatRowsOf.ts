import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";
import type {StatRow} from "@src/react/components/dom/weapon-numbers/types/StatRow";

/** A weapon's stats as the workshop's card and the reveal print them, in plain words: what it takes off, how often it fires, how much it holds, how long it reloads and how far it sees. */
export function statRowsOf(weapon: Weapon): readonly StatRow[] {
  return [
    {label: "Damage", value: `${weapon.bulletDamage}`},
    {label: "Shots a second", value: `${Number((1 / weapon.fireIntervalSeconds).toFixed(1))}`},
    {label: "Magazine", value: `${weapon.magazineSize}`},
    {label: "Reserve", value: `${weapon.startingReserve}`},
    {label: "Reload", value: `${weapon.reloadSeconds} s`},
    {label: "Vision", value: `${weapon.visionDegrees}° out to ${weapon.visionRange} tiles`},
  ];
}
