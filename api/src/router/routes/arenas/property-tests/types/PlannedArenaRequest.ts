import type {PlannedArenaOutcome} from "@src/router/routes/arenas/property-tests/types/PlannedArenaOutcome";

/** One arena request a property test sends: which account asks and what the pipeline will do with it. */
export interface PlannedArenaRequest {
  accountId: string;
  outcome: PlannedArenaOutcome;
}
