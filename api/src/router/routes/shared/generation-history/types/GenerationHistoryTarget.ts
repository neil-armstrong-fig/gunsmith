import type {GenerationAttempt} from "@src/shared/accounts/types/GenerationAttempt";

export interface GenerationHistoryTarget {
  kind: GenerationAttempt["kind"];
  pipelineVersion: string;
}
