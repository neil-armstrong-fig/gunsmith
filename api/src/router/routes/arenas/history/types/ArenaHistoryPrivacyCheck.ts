/** True means an independent privacy check cleared the submitted text for internal history. */
export type ArenaHistoryPrivacyCheck = (prompt: string) => Promise<boolean>;
