/** An arena this browser puts forward: a built-in by name, or one of this player's saved arenas by id (never its body). */
export type ArenaChoice = {kind: "builtIn"; name: string} | {kind: "saved"; id: string};
