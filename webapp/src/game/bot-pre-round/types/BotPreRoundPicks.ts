import type {Weapon} from "@gunsmith/engine/weapon/types/Weapon";

/** What a player locked in at the pre-round: the weapon for slot 1 and the one for slot 2. */
export interface BotPreRoundPicks {
  first: Weapon;
  second: Weapon;
}
