import type {PrepareFighterRequest} from "@gunsmith/engine/game-loop/fighter/types/PrepareFighterRequest";
import type {FighterTurn} from "@gunsmith/engine/game-loop/fighter/types/FighterTurn";
import {equippedWeapon} from "@gunsmith/engine/loadout/EquippedWeapon";
import {switchWeapon} from "@gunsmith/engine/loadout/SwitchWeapon";
import {aimPlayer} from "@gunsmith/engine/player/AimPlayer";
import {movePlayer} from "@gunsmith/engine/player/MovePlayer";
import {reloadWeapon} from "@gunsmith/engine/weapon/ReloadWeapon";
import {pullTrigger} from "@gunsmith/engine/weapon/TriggerPull";

/**
 * The part of a step that belongs to one fighter, the player or the opponent alike: the weapon is switched (which cancels
 * a reload), the reload starts or counts down (so a switch and a reload asked for together reload the new weapon), the
 * fighter crouches or stands as asked, walks (slower crouched), turns to the aim, and the trigger is judged. It does not fly any bullet or let one go: see `shootFighter`.
 */
export function prepareFighter({arena, fighter, input, seconds}: PrepareFighterRequest): FighterTurn {
  const ready = reloadWeapon(switchWeapon(fighter, input.switchTo), input.reload, seconds);
  const carriedWeapon = equippedWeapon(ready);
  const crouching = input.crouching === true;
  const position = movePlayer(arena, {position: ready.position, direction: input.direction, seconds, crouching});
  const aim = aimPlayer(ready.aim, position, input.aimAt);
  const trigger = pullTrigger({
    cooldownSeconds: ready.cooldownSeconds,
    firing: input.firing,
    seconds,
    fireIntervalSeconds: carriedWeapon.weapon.fireIntervalSeconds,
    rounds: carriedWeapon.rounds,
    reloading: ready.reloadRemainingSeconds !== undefined,
  });

  return {
    fighter: {...ready, position, aim, crouching, cooldownSeconds: trigger.cooldownSeconds},
    fires: trigger.fires,
  };
}
