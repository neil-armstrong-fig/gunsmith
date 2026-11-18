/** What each of the two players puts forward when one describes an arena and the other names a built-in arena. */
export interface PromptAndBuiltInSubmissions {
  /** The arena the first player describes, in words: a prompt. */
  player1: string;
  /** The built-in arena the second player names, by name: it may be one that does not exist. */
  player2: string;
}
