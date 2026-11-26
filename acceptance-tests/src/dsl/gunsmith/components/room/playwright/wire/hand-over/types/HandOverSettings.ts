import type {SavedWeaponHolder} from "@src/dsl/gunsmith/components/room/playwright/wire/hand-over/types/SavedWeaponHolder";

/** What a spec asked of the frames the page is handed, read when a connection opens. */
export interface HandOverSettings {
  /** Hand over only every `n`th snapshot (1 is every one). */
  snapshotsPerHandover: number;
  /** Whose fighter carries a saved weapon in slot 1, standing in for a signed-in seat, or nobody's. */
  savedWeaponHolder: SavedWeaponHolder | undefined;
}
