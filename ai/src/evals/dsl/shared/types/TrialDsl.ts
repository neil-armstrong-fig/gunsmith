import type {EvalDomain} from "@evals/dsl/shared/types/EvalDomain";

/**
 * What a DSL gives the mapping so a spec can run each trial in a scope of its own: which domain it is, how many trials its driver runs,
 * and a fresh DSL for one trial. The fresh DSL shares the driver (so models, the paid spend guard and kept results exist once) but
 * runs a request once and holds only that trial's answer.
 */
export interface TrialDsl<Dsl> {
  readonly domain: EvalDomain;
  readonly trials: number;
  forTrial(): Dsl;
}
