import type {ChooseArenaAction} from "@src/durable-objects/match/messages/types/ChooseArenaAction";
import type {ChooseWeaponsAction} from "@src/durable-objects/match/messages/types/ChooseWeaponsAction";
import type {LockInArenaAction} from "@src/durable-objects/match/messages/types/LockInArenaAction";
import type {LockInWeaponsAction} from "@src/durable-objects/match/messages/types/LockInWeaponsAction";
import type {PickArenaAction} from "@src/durable-objects/match/messages/types/PickArenaAction";

/** Something a seat may do while the room is choosing. */
export type PreRoundAction =
  ChooseArenaAction | LockInArenaAction | ChooseWeaponsAction | LockInWeaponsAction | PickArenaAction;
