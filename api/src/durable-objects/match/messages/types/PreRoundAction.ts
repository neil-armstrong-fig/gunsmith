import type {ChooseArenaAction} from "@src/durable-objects/match/messages/types/ChooseArenaAction";
import type {LockInArenaAction} from "@src/durable-objects/match/messages/types/LockInArenaAction";
import type {PickArenaAction} from "@src/durable-objects/match/messages/types/PickArenaAction";

/** Something a seat may do while the room is choosing. */
export type PreRoundAction = ChooseArenaAction | LockInArenaAction | PickArenaAction;
