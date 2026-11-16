import type {Size} from "@src/dsl/gunsmith/types/Size";

/** One picture a cursor offers: how many of its pixels make a CSS pixel (1 for an ordinary screen, 2 for a sharp one), and how big the file really is. */
export interface CursorPicture {
  scale: number;
  size: Size;
}
