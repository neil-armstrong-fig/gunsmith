/** An arena as the server shows it while choosing: a built-in by name, a saved one by name, with its drawing (`rows`) on the other seat's saved arena once both are locked in. Never an id. */
export type ArenaView = {kind: "builtIn"; name: string} | {kind: "saved"; name: string; rows?: readonly string[]};
