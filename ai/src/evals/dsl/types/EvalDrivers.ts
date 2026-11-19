import type {AppearanceDriver} from "@evals/dsl/appearance/types/AppearanceDriver";
import type {ArenaPipelineDriver} from "@evals/dsl/arena/types/ArenaPipelineDriver";
import type {ArenaSubmissionDriver} from "@evals/dsl/arena-submission/types/ArenaSubmissionDriver";
import type {WeaponPipelineDriver} from "@evals/dsl/weapon/types/WeaponPipelineDriver";

/** The driver of every domain for one tier, as the DSLs see them: only the seam each DSL owns. */
export interface EvalDrivers {
  weapon: WeaponPipelineDriver;
  appearance: AppearanceDriver;
  arena: ArenaPipelineDriver;
  arenaSubmission: ArenaSubmissionDriver;
}
