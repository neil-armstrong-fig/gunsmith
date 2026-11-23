import type {ArenaHistoryPrivacyCheck} from "@src/router/routes/arenas/history/types/ArenaHistoryPrivacyCheck";

export interface ArenaHistoryRequest {
  privacyCheck: ArenaHistoryPrivacyCheck;
  token: string;
  createdAt: Date;
}
