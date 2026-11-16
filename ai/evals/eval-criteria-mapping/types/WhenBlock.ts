import type {DefineWhen} from "@evals/eval-criteria-mapping/types/DefineWhen";

/** `when` for a criterion that must hold (a regression), and `when.capability` for one that is a hill to climb. */
export interface WhenBlock {
  (description: string, define: DefineWhen): void;
  capability(description: string, define: DefineWhen): void;
}
