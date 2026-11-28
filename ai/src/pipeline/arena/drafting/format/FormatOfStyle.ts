import type {ArenaStyle} from "@gunsmith/shared/arena-style/ArenaStyle";
import type {ArenaFormat} from "@gunsmith/ai/pipeline/arena/drafting/format/ArenaFormat";

// A record, so a style added to `ARENA_STYLES` without a format is a type error, not a silent fall back.
const FORMATS: Record<ArenaStyle, ArenaFormat> = {
  blue: "shapes",
  red: "editBuiltIn",
};

/** The format the model is asked to answer in for the style a player chose: blue draws shapes (any size), red edits a built-in arena (its size). */
export function formatOfStyle(style: ArenaStyle): ArenaFormat {
  return FORMATS[style];
}
