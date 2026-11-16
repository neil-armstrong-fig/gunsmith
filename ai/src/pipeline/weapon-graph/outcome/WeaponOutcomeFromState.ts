import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import type {WeaponGraphStateValues} from "@gunsmith/ai/pipeline/weapon-graph/state/WeaponGraphState";

/** What a player is told when a request was a weapon request but no valid weapon came out of it, even after the one repair. */
const INVALID_WEAPON_REASON = "We could not build a valid weapon from that request. Try describing it differently.";

/**
 * Reads how the run ended off the state it ended in: turned away (a reason was set), drawn (a drawing exists, which only a weapon
 * that passed every check ever gets), or otherwise invalid. A weapon left in the state by a first try that was then refused is
 * never handed on, because only a drawn weapon is created.
 */
export function weaponOutcomeFromState(state: WeaponGraphStateValues): WeaponOutcome {
  if (state.rejectionReason !== undefined) {
    return {status: "rejected", reason: state.rejectionReason, nodes: state.nodes, modelCalls: state.modelCalls};
  }

  if (state.appearance) {
    return {
      status: "created",
      weapon: state.weapon,
      appearance: state.appearance,
      nodes: state.nodes,
      modelCalls: state.modelCalls,
    };
  }

  return {status: "invalid", reason: INVALID_WEAPON_REASON, nodes: state.nodes, modelCalls: state.modelCalls};
}
