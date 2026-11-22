/** A weapon a seat puts forward, as it names it: a built-in by key, or one of its own saved weapons by id (never a body). */
export type WeaponChoice = {kind: "builtIn"; key: string} | {kind: "saved"; id: string};
