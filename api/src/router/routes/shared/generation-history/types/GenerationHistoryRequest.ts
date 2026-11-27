import type {GenerationHistoryRedaction} from "@src/router/routes/shared/generation-history/types/GenerationHistoryRedaction";
import type {GenerationHistoryTarget} from "@src/router/routes/shared/generation-history/types/GenerationHistoryTarget";

export interface GenerationHistoryRequest extends GenerationHistoryTarget {
  redaction: GenerationHistoryRedaction;
  token: string;
  createdAt: Date;
}
