import type {Colour} from "@src/dsl/gunsmith/types/Colour";

/** The colour most of the places show, which is the floor's (or the fog's over it) because a drawing covers only a small part of the square. */
export function floorColour(colours: Colour[]): Colour {
  const counts = new Map<string, number>();
  colours.forEach(colour => {
    const key = `${colour.red},${colour.green},${colour.blue}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  const [commonest = "0,0,0"] = [...counts.entries()].sort((first, second) => second[1] - first[1]).map(([key]) => key);
  const [red = 0, green = 0, blue = 0] = commonest.split(",").map(Number);

  return {red, green, blue};
}
