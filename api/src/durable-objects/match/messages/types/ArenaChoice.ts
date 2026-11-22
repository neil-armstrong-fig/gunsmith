/** An arena a seat puts forward, as it names it: a built-in by name, or one of its own saved arenas by id (never a body). */
export type ArenaChoice = {kind: "builtIn"; name: string} | {kind: "saved"; id: string};
