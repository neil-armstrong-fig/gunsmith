/** A weapon as the server shows it while choosing: a built-in by key (the page has it), a saved one by its name alone. Never an id; a saved weapon's numbers come in the reveal. */
export type WeaponView = {kind: "builtIn"; key: string} | {kind: "saved"; name: string};
