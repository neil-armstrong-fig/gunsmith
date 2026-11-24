import type {GenerationAttempt} from "@src/accounts/types/GenerationAttempt";

export interface GenerationHistoryTarget {
  kind: GenerationAttempt["kind"];
  pipelineVersion: string;
}
