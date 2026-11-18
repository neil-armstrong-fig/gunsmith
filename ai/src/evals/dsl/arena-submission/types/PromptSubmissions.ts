/** What each of the two players puts forward as an arena prompt. A player who puts nothing forward is left out. */
export interface PromptSubmissions {
  /** The arena the first player describes, in words. */
  player1?: string;
  /** The arena the second player describes, in words. */
  player2?: string;
}
