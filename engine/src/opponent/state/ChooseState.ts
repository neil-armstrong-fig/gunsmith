import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import {enterState} from "@gunsmith/engine/opponent/state/EnterState";
import {winningTheRace} from "@gunsmith/engine/opponent/state/seeking/WinningTheRace";
import type {OpponentBrain} from "@gunsmith/engine/opponent/types/OpponentBrain";
import type {OpponentContext} from "@gunsmith/engine/opponent/types/OpponentContext";
import type {OpponentState} from "@gunsmith/engine/opponent/types/OpponentState";

/**
 * The transitions, checked at the start of each step in this order. An empty magazine sends it to reload from any
 * other state, seeing the player or not. Next, a weapon lying in the arena that it will win the walk to (`winningTheRace`)
 * sends it to seek it, from any state, in sight of the player or not; it walks to it and stops seeking when the weapon is
 * gone or the player has pulled ahead. A reload or a seek that is over sends it back to engaging if it sees the player, to
 * searching if it has seen them before, and to wandering otherwise (a finished reload may go straight to seeking). Otherwise: sighting the player
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

  if (winningTheRace(brain, context)) {
    return stayOrEnter(brain, "seek");
  }

  if (brain.state === "seek") {
    return enterState(brain, backToTheFight(brain, context));
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
  if (winningTheRace(brain, context)) {
    return "seek";
  }

  return backToTheFight(brain, context);
}

function backToTheFight(brain: OpponentBrain, context: OpponentContext): OpponentState {
  if (context.sees) {
    return "engage";
  }

  if (brain.lastSeen) {
    return "search";
  }

  return "wander";
}
