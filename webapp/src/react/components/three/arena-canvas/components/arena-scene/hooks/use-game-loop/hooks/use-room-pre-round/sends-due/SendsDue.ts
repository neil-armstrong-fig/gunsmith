import type {DueAction} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/sends-due/types/DueAction";
import type {SendsDue} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/sends-due/types/SendsDue";
import type {SendsDueRequest} from "@src/react/components/three/arena-canvas/components/arena-scene/hooks/use-game-loop/hooks/use-room-pre-round/sends-due/types/SendsDueRequest";

/** How long to wait before asking again for what the server does not yet hold, in real seconds: a lock sent a moment ago may still be on its way, and a slow link is not flooded. */
const RESEND_SECONDS = 0.5;

/**
 * What of what the player locked in to send now. Level-triggered: whatever the server's own word says it does not hold is due, at once the first
 * time and after `RESEND_SECONDS` each time after, and nothing once it holds it all. A seat made new by a reconnection while alone knows
 * nothing, so its word disagrees again and what was locked in goes out again. The second weapon is sent only once the server says the first is
 * locked in (it ignores one that comes first), the pick only while it asks for one, and the ask to begin only while the reveal is shown.
 */
export function sendsDue({readout, wants, secondsSinceSend, frameSeconds}: SendsDueRequest): SendsDue {
  const actions = actionsDue({readout, wants});
  if (actions.length === 0) {
    return {actions, secondsSinceSend: RESEND_SECONDS};
  }

  const waited = secondsSinceSend + frameSeconds;
  if (waited < RESEND_SECONDS) {
    return {actions: [], secondsSinceSend: waited};
  }

  return {actions, secondsSinceSend: 0};
}

function actionsDue({readout, wants}: Pick<SendsDueRequest, "readout" | "wants">): DueAction[] {
  const actions: DueAction[] = [];
  const {own} = readout;
  const [first, second] = wants.weapons;

  if (first !== undefined && !own.slots[0].locked) {
    actions.push({kind: "weapon", slot: 1, weapon: first});
  }

  if (second !== undefined && own.slots[0].locked && !own.slots[1].locked) {
    actions.push({kind: "weapon", slot: 2, weapon: second});
  }

  if (wants.arena !== undefined && !own.arenaLocked) {
    actions.push({kind: "arena", arena: wants.arena});
  }

  if (wants.pick !== undefined && readout.stage === "picking" && !own.picked) {
    actions.push({kind: "pick", pick: wants.pick});
  }

  if (wants.start && readout.stage === "revealing" && !own.ready) {
    actions.push({kind: "start"});
  }

  return actions;
}
