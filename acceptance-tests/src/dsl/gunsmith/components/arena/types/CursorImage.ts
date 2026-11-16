import type {CursorHotspot} from "@src/dsl/gunsmith/components/arena/types/CursorHotspot";
import type {Size} from "@src/dsl/gunsmith/types/Size";

/** A picture used as the mouse cursor: how big the file really is, and which of its pixels is the mouse position. */
export interface CursorImage {
  size: Size;
  hotspot: CursorHotspot;
}
