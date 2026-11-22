import type {LockInArenaAction} from "@src/durable-objects/match/messages/types/LockInArenaAction";
import type {LockInWeaponsAction} from "@src/durable-objects/match/messages/types/LockInWeaponsAction";
import type {PickArenaAction} from "@src/durable-objects/match/messages/types/PickArenaAction";

/** What a seat may do while the room is choosing that the room can do at once: lock a step in, or pick an arena. */
export type PreRoundCommand = LockInArenaAction | LockInWeaponsAction | PickArenaAction;
