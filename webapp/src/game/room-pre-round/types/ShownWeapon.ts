/** A weapon as the server lets this page know it while choosing: a built-in by key (the page has it), a saved one by its name alone. */
export type ShownWeapon = {kind: "builtIn"; key: string} | {kind: "saved"; name: string};
