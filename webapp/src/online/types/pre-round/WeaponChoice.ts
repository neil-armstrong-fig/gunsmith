/** A weapon this browser puts forward: a built-in by key, or one of this player's saved weapons by id (never its body). */
export type WeaponChoice = {kind: "builtIn"; key: string} | {kind: "saved"; id: string};
