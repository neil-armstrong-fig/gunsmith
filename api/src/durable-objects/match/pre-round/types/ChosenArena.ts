import type {BuiltInArena} from "@gunsmith/engine/arena/built-in/types/BuiltInArena";

/**
 * An arena a seat has put forward, as the room holds it: a built-in by name, or one of the seat's own saved arenas with its id (the
 * room's own, never sent to a page: another seat must not learn an id from a library) and the drawing the room already checked.
 */
export type ChosenArena = {kind: "builtIn"; name: string} | {kind: "saved"; id: string; arena: BuiltInArena};
