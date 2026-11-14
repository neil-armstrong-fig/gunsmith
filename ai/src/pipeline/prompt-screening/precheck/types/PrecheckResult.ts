/** Whether a prompt may go on to a model, and if not, why, in words a player can read. */
export type PrecheckResult = {accepted: true} | {accepted: false; reason: string};
