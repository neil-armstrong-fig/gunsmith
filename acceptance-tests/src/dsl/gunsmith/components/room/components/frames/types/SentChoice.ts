import type {ChoiceKind} from "@src/dsl/gunsmith/components/room/components/frames/types/ChoiceKind";
import type {ChoiceStep} from "@src/dsl/gunsmith/components/room/components/frames/types/ChoiceStep";

/** One choice the page sent the room while choosing: for which step (and which slot, for a weapon), and what it put forward. */
export interface SentChoice {
  step: ChoiceStep;
  /** The weapon's slot, 1 or 2; nothing for the arena. */
  slot: number | undefined;
  kind: ChoiceKind;
  /** A built-in weapon's key, a built-in arena's name, or a saved item's id. */
  reference: string;
}
