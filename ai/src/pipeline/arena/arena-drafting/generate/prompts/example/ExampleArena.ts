import type {ArenaDrawing} from "@gunsmith/ai/pipeline/arena/types/ArenaDrawing";

/**
 * The one arena the generation prompt shows the model: walled, two pillars, and a raised platform reached by one stair. A test
 * holds it to the same validator the model's answers meet, so the prompt can never teach a drawing the game would refuse.
 */
export const EXAMPLE_ARENA: ArenaDrawing = {
  name: "Platform Yard",
  rows: [
    "####################",
    "#..................#",
    "#..##..........##..#",
    "#........>11.......#",
    "#........#11.......#",
    "#..##..........##..#",
    "#..................#",
    "####################",
  ],
};
