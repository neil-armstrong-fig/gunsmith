/** Where the room's pre-round stands, as the server says it: choosing weapons and an arena, picking between two arenas, decided, or showing what was decided before the match begins. */
export type RoomStage = "choosing" | "picking" | "decided" | "revealing";
