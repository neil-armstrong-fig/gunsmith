/** A weapon the player has locked in for a slot: a built-in by its key, or one of their saved weapons by its library id. Never a body: the server finds the id among that player's saved items. */
export type WantedWeapon = {kind: "builtIn"; key: string} | {kind: "saved"; id: string};
