import type {WeaponIdentity} from "@gunsmith/engine/weapon/types/WeaponIdentity";
import type {Appearance} from "@gunsmith/shared/appearance/schema/Appearance";

/** A saved weapon the reveal named in one fighter's slot: who it is (every saved weapon shares a key, so the name says which) and its drawing, parsed once. */
export interface SavedDrawing {
  identity: WeaponIdentity;
  appearance: Appearance;
}
