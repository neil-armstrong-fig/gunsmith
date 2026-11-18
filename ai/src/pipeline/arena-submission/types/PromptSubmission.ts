/** A player's arena described in words: data, never instructions. It is screened, and if it passes it goes on to be generated. */
export interface PromptSubmission {
  kind: "prompt";
  playerId: string;
  prompt: string;
}
