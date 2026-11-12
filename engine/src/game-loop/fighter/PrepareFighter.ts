import type {Arena} from "@gunsmith/engine/arena/types/Arena";
import type {FighterTurn} from "@gunsmith/engine/game-loop/fighter/types/FighterTurn";
import type {Input} from "@gunsmith/engine/game-loop/types/Input";
import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import {switchWeapon} from "@gunsmith/engine/loadout/SwitchWeapon";
import {aimPlayer} from "@gunsmith/engine/player/AimPlayer";
import {movePlayer} from "@gunsmith/engine/player/MovePlayer";
import type {Player} from "@gunsmith/engine/player/types/Player";
import {reloadWeapon} from "@gunsmith/engine/weapon/ReloadWeapon";
import {pullTrigger} from "@gunsmith/engine/weapon/TriggerPull";

/**
 * The part of a step that belongs to one fighter, the player or the opponent alike: the weapon is switched (which cancels
 * a reload), the reload starts or counts down (so a switch and a reload asked for together reload the new weapon), the
 * fighter walks, turns to the aim, and the trigger is judged. It does not fly any bullet or let one go: see `shootFighter`.
 */
export function prepareFighter(arena: Arena, fighter: Player, input: Input, seconds: number): FighterTurn {
  const ready = reloadWeapon(switchWeapon(fighter, input.switchTo), input.reload, seconds);
  const carriedWeapon = equippedWeapon(ready);
  const position = movePlayer(arena, ready.position, input.direction, seconds);
  const aim = aimPlayer(ready.aim, position, input.aimAt);
  const trigger = pullTrigger({
    cooldownSeconds: ready.cooldownSeconds,
    firing: input.firing,
    seconds,
    fireIntervalSeconds: carriedWeapon.weapon.fireIntervalSeconds,
    rounds: carriedWeapon.rounds,
    reloading: ready.reloadRemainingSeconds !== undefined,
  });

  return {fighter: {...ready, position, aim, cooldownSeconds: trigger.cooldownSeconds}, fires: trigger.fires};
}
