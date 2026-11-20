import type {RememberedChoices} from "@src/store/pre-round-choices/types/RememberedChoices";

/**
 * What the pre-round remembers between matches and visits: the weapon for each slot and the arena last locked in, kept in this browser's local storage so the
 * next pre-round begins where the last one ended. A remembered id whose weapon or arena has since left the shelf is only an id nothing matches, and the choosing falls back to its default.
 */
export interface PreRoundChoicesStore {
  firstWeaponId: string | undefined;
  secondWeaponId: string | undefined;
  arenaId: string | undefined;
  remember: (choices: RememberedChoices) => void;
}
