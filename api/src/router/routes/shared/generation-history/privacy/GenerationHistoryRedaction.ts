import {redactPersonalInformation} from "@gunsmith/ai/privacy/RedactPersonalInformation";
import {workerEnvironment} from "@src/env/WorkerEnvironment";
import type {GenerationHistoryRedaction} from "@src/router/routes/shared/generation-history/types/GenerationHistoryRedaction";

/**
 * What turns a prompt into history text, or nothing when history is not kept. Capture is off unless the Worker var
 * `GENERATION_HISTORY_CAPTURE` is `"true"`, which neither `wrangler.jsonc` nor `infra/` sets: it waits on the privacy assessments and
 * the Make notice (`docs/privacy-and-data.md`). Once on, every completed attempt keeps its prompt with ai's best-effort redaction.
 */
export function generationHistoryRedaction(): GenerationHistoryRedaction | undefined {
  if (workerEnvironment.GENERATION_HISTORY_CAPTURE !== "true") return undefined;

  return redactPersonalInformation;
}
