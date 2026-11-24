/** What reading a model's reply in its format gives: the drawing it describes (not yet checked), or a sentence for each fault that stopped the reading. */
export type ArenaReading = {ok: true; drawing: unknown} | {ok: false; errors: string[]};
