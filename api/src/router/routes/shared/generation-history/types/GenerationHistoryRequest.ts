import type {GenerationHistoryPrivacyCheck} from "@src/router/routes/shared/generation-history/types/GenerationHistoryPrivacyCheck";
import type {GenerationHistoryTarget} from "@src/router/routes/shared/generation-history/types/GenerationHistoryTarget";

export interface GenerationHistoryRequest extends GenerationHistoryTarget {
  privacyCheck: GenerationHistoryPrivacyCheck;
  token: string;
  createdAt: Date;
}
