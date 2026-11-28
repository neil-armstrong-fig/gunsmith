/**
 * The drawings the weapon lying in the arena can be given. Through the page's `?weaponDrawing=` seam: `lantern` is art's jellyfish
 * cage, `cactus` is art's branching cluster; `refused` is one the game's schema turns away, so the game draws its stand-in.
 * `built-in SMG` asks for no drawing, so the weapon keeps its own authored picture.
 */
export type PickupDrawing = "lantern" | "cactus" | "refused" | "built-in SMG";
