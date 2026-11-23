import type {GenerationAttempt} from "@src/accounts/types/GenerationAttempt";
import type {AttemptOutcome} from "@src/router/routes/shared/generation-history/types/AttemptOutcome";
import type {CreditReservation} from "@src/router/routes/shared/types/CreditReservation";

interface AttemptDiagnostics extends Pick<GenerationAttempt, "pipelineVersion" | "codeEdits" | "modelRepairs"> {
  relevance: string;
}

export interface CompletedGenerationAttempt {
  reservation: CreditReservation;
  diagnostics: AttemptDiagnostics;
  classification: AttemptOutcome;
}
