import type {RevealPicture} from "@src/dsl/gunsmith/playwright/weapon-card/types/RevealPicture";

/** The picture the reveal shows for each side's weapons, in slot order. */
export interface RevealPictures {
  yours: RevealPicture[];
  opponent: RevealPicture[];
}
