import type {World} from "@gunsmith/engine/game-loop/types/World";
import type {OpponentDecision} from "@gunsmith/engine/opponent/types/OpponentDecision";

/** How the opponent decides what to ask for this step, from the world as it stands: its brain for a scripted one, a person's input for a human one. */
export type ChooseOpponent = (world: World, seconds: number) => OpponentDecision;
