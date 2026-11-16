import type {CursorHotspot} from "@src/dsl/gunsmith/components/arena/types/CursorHotspot";
import type {CursorPicture} from "@src/dsl/gunsmith/components/arena/types/CursorPicture";

/**
 * The pictures used as the mouse cursor, from the one for an ordinary screen to the one for a sharp screen, and which point of them
 * is the mouse position. The hotspot is in CSS pixels, so on a picture with a scale of 2 it is twice as many of that picture's pixels.
 */
export interface CursorImage {
  pictures: CursorPicture[];
  hotspot: CursorHotspot;
}
