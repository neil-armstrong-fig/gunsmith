import damageCrunchUrl from "@src/assets/sounds/files/sfx-damage-crunch.mp3?url&no-inline";
import emptyClickUrl from "@src/assets/sounds/files/sfx-empty-click.mp3?url&no-inline";
import hitUrl from "@src/assets/sounds/files/sfx-hit.mp3?url&no-inline";
import pickupUrl from "@src/assets/sounds/files/sfx-pickup.mp3?url&no-inline";
import ringDamageLoopUrl from "@src/assets/sounds/files/sfx-ring-damage-loop.wav?url&no-inline";
import reloadUrl from "@src/assets/sounds/files/sfx-reload.mp3?url&no-inline";
import shotUrl from "@src/assets/sounds/files/sfx-shot.mp3?url&no-inline";
import footstepUrl from "@src/assets/sounds/files/sfx-footstep.mp3?url&no-inline";
import type {SoundKey} from "@src/assets/sounds/types/SoundKey";

/** Where each sound's file is served from, by key. The build gives a file its own address, which is why they are imported. */
export const SOUND_URLS: Record<SoundKey, string> = {
  "sfx-empty-click": emptyClickUrl,
  "sfx-damage-crunch": damageCrunchUrl,
  "sfx-hit": hitUrl,
  "sfx-pickup": pickupUrl,
  "sfx-ring-damage-loop": ringDamageLoopUrl,
  "sfx-shot": shotUrl,
  "sfx-footstep": footstepUrl,
  "sfx-reload": reloadUrl,
};
