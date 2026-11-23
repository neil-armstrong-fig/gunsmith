/** True means an independent privacy check cleared the submitted text for internal history. */
export type GenerationHistoryPrivacyCheck = (prompt: string) => Promise<boolean>;
