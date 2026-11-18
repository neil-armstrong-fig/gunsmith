/** A player's arena chosen from the built-in ones, by name. It needs no screening and no generation, so it costs no model call. */
export interface BuiltInSubmission {
  kind: "built-in";
  playerId: string;
  builtInName: string;
}
