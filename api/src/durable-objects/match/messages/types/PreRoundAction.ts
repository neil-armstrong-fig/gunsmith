import type {PreRoundChoice} from "@src/durable-objects/match/messages/types/PreRoundChoice";
import type {PreRoundCommand} from "@src/durable-objects/match/messages/types/PreRoundCommand";

/** Something a seat may do while the room is choosing. */
export type PreRoundAction = PreRoundChoice | PreRoundCommand;
