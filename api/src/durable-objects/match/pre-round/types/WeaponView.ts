/** A weapon as a seat may be shown it: a built-in by key, or a saved one by its name. Never an id; the weapon itself comes in the `reveal` frame. */
export type WeaponView = {kind: "builtIn"; key: string} | {kind: "saved"; name: string};
