import type {PlannedOutcome} from "@src/router/routes/weapons/property-tests/types/PlannedOutcome";

/** One request a property test sends: which account asks and what the pipeline will do with it. */
export interface PlannedRequest {
  accountId: string;
  outcome: PlannedOutcome;
}
