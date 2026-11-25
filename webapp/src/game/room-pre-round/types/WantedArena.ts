/** An arena the player has locked in: a built-in by its name, or one of their saved arenas by its library id. Never a body: the server finds the id among that player's saved items. */
export type WantedArena = {kind: "builtIn"; name: string} | {kind: "saved"; id: string};
