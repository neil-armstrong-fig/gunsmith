import type {KeptDrawing} from "@evals/eval-criteria-mapping/appearance/drawings/types/KeptDrawing";
import type {EvalTier} from "@evals/eval-criteria-mapping/tier/types/EvalTier";

/** What `keepDrawing` needs: the drawing, the tier it came from, where to write, and whether the run asked to keep drawings. */
export interface KeepDrawingOptions {
  folder: string;
  tier: EvalTier;
  enabled: boolean;
  drawing: KeptDrawing;
}
