import type {Colour} from "@src/dsl/gunsmith/types/Colour";

/** Whether a colour on the screen is `target`, give or take `tolerance` in each of its three parts: edges and rounding keep a drawing from being exact. */
export function colourIsNear(colour: Colour, target: Colour, tolerance: number): boolean {
  return (
    Math.abs(colour.red - target.red) <= tolerance &&
    Math.abs(colour.green - target.green) <= tolerance &&
    Math.abs(colour.blue - target.blue) <= tolerance
  );
}
