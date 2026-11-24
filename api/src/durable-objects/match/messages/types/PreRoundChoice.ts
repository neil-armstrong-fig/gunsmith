import type {ChooseArenaAction} from "@src/durable-objects/match/messages/types/ChooseArenaAction";
import type {ChooseWeaponAction} from "@src/durable-objects/match/messages/types/ChooseWeaponAction";

/** What a seat may put forward while the room is choosing: an arena or a weapon, named by built-in name or key, or by saved id (which `Match` must look up before the room can take it). */
export type PreRoundChoice = ChooseArenaAction | ChooseWeaponAction;
