/**
 * An arena as a seat may be shown it: a built-in by name, or a saved one by its name alone. The drawing (`rows`) is on a saved arena only
 * in what the other seat is shown once both are locked in, since a page does not have the other player's saved arena. Never an id.
 */
export type ArenaView = {kind: "builtIn"; name: string} | {kind: "saved"; name: string; rows?: readonly string[]};
