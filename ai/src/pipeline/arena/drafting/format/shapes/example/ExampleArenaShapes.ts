import type {ArenaShapes} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/draft/ArenaShapesDraft";

/**
 * The one arena the shapes prompt shows the model: the same yard as `EXAMPLE_ARENA` (walled, two pillars each side and a raised
 * platform reached by one stair), written as shapes. It has no cover block on purpose: a model copies its example, so cover here
 * would make a copy of it look like cover the model chose. A test holds it to the validator the model's answers meet.
 */
export const EXAMPLE_ARENA_SHAPES: ArenaShapes = {
  name: "Platform Yard",
  width: 20,
  height: 8,
  walls: [
    {x: 3, y: 2, width: 2, height: 1},
    {x: 15, y: 2, width: 2, height: 1},
    {x: 3, y: 5, width: 2, height: 1},
    {x: 15, y: 5, width: 2, height: 1},
  ],
  platforms: [{x: 10, y: 3, width: 2, height: 2, level: 1}],
  stairs: [{x: 9, y: 3, direction: "east"}],
};
