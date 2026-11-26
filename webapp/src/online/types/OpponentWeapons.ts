import type {OpponentWeaponFrame} from "@src/online/types/OpponentWeaponFrame";

/** The other player's saved weapons the server has told this page, in slot 1 and slot 2; `undefined` for a slot it has not. */
export type OpponentWeapons = readonly [OpponentWeaponFrame | undefined, OpponentWeaponFrame | undefined];
