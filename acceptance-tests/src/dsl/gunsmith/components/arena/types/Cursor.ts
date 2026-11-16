import type {CursorImage} from "@src/dsl/gunsmith/components/arena/types/CursorImage";

/** The mouse cursor the browser shows at one place: a picture if the page asked for one, and the keyword it falls back to. */
export interface Cursor {
  image?: CursorImage;
  keyword: string;
}
