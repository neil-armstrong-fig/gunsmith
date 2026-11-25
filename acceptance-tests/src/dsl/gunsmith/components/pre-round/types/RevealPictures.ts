import type {RevealPicture} from "@src/dsl/gunsmith/components/pre-round/types/RevealPicture";

/** The picture the reveal shows for each side's weapons, in slot order. */
export interface RevealPictures {
  yours: RevealPicture[];
  opponent: RevealPicture[];
}
