import type {Strip} from "@src/react/components/three/arena-terrain/components/arena-heights/drops/types/Strip";

/** How a drop is drawn: a bright lip along the raised tile's edge and a dark shadow on the lower ground beside it. */
export interface DropStrips {
  lip: Strip;
  shadow: Strip;
}
