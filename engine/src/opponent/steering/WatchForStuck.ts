import {DIFFICULTY} from "@gunsmith/engine/opponent/Difficulty";
import type {StuckCheck} from "@gunsmith/engine/opponent/steering/types/StuckCheck";
import type {StuckLook} from "@gunsmith/engine/opponent/steering/types/StuckLook";
import type {StuckWatch} from "@gunsmith/engine/opponent/types/StuckWatch";

/**
 * Notices an opponent that is trying to walk and not getting anywhere (a pillar in its way, a corner it slides along
 * without gaining ground). After `stuckSeconds` of walking it checks it has moved `stuckDistance` from where it began,
 * and either way begins a fresh look from where it now stands. A step spent not walking forgets the time, so standing
 * still on purpose is never stuck. This is the whole of its navigation: no map, no path.
 */
export function watchForStuck(watch: StuckWatch, look: StuckLook): StuckCheck {
  if (!look.walking) {
    return {watch: {anchor: look.position, seconds: 0}, stuck: false};
  }

  const seconds = watch.seconds + look.seconds;
  if (seconds < DIFFICULTY.stuckSeconds) {
    return {watch: {anchor: watch.anchor, seconds}, stuck: false};
  }

  const gained = Math.hypot(look.position.x - watch.anchor.x, look.position.y - watch.anchor.y);

  return {watch: {anchor: look.position, seconds: 0}, stuck: gained < DIFFICULTY.stuckDistance};
}
