import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import {enterState} from "@gunsmith/engine/opponent/state/EnterState";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import type {OpponentState} from "@gunsmith/engine/opponent/types/OpponentState";

/**
 * The transitions, checked at the start of each step in this order. An empty magazine sends it to reload from any
 * other state, seeing the player or not. A reload that has given it rounds again sends it back to engaging if it
 * sees the player, to searching if it has seen them before, and to wandering otherwise. Otherwise: sighting the player
 * while wandering or searching starts engaging (and its reaction time), and losing sight of them while engaging starts a
 * search. A state it stays in keeps everything it remembers. How long a search lasts, and giving up when stuck, are the
 * state's own business, not decided here.
 */
export function chooseState(brain: OpponentBrain, context: OpponentContext): OpponentBrain {
  if (equippedWeapon(context.opponent).rounds === 0) {
    return stayOrEnter(brain, "reload");
  }

  if (brain.state === "reload") {
    return enterState(brain, afterReload(brain, context));
  }

  if (context.sees) {
    return stayOrEnter(brain, "engage");
  }

  if (brain.state === "engage") {
    return enterState(brain, "search");
  }

  return brain;
}

function stayOrEnter(brain: OpponentBrain, state: OpponentState): OpponentBrain {
  if (brain.state === state) {
    return brain;
  }

  return enterState(brain, state);
}

function afterReload(brain: OpponentBrain, context: OpponentContext): OpponentState {
  if (context.sees) {
    return "engage";
  }

  if (brain.lastSeen) {
    return "search";
  }

  return "wander";
}
