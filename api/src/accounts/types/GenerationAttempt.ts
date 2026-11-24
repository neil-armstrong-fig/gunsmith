import type {generationAttempts} from "@src/accounts/schema/GenerationAttempts";

type StoredAttempt = typeof generationAttempts.$inferSelect;

export interface GenerationAttempt extends Omit<StoredAttempt, "prompt" | "failureStage" | "failureReason"> {
  prompt?: string;
  failureStage?: NonNullable<StoredAttempt["failureStage"]>;
  failureReason?: string;
}
