import {actEngage} from "@gunsmith/engine/opponent/state/acting/Engage";
import {actReload} from "@gunsmith/engine/opponent/state/acting/Reload";
import {actSearch} from "@gunsmith/engine/opponent/state/acting/Search";
import {actWander} from "@gunsmith/engine/opponent/state/acting/Wander";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import type {StateAct} from "@gunsmith/engine/opponent/types/StateAct";

/** Hands the step to the state the brain is in. */
export function actOnState(brain: OpponentBrain, context: OpponentContext): StateAct {
  if (brain.state === "engage") {
    return actEngage(brain, context);
  }

  if (brain.state === "reload") {
    return actReload(brain, context);
  }

  if (brain.state === "search") {
    return actSearch(brain, context);
  }

  return actWander(brain, context);
}
