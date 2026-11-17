import damageCrunchUrl from "@src/assets/sounds/files/sfx-damage-crunch.mp3?url&no-inline";
import emptyClickUrl from "@src/assets/sounds/files/sfx-empty-click.mp3?url&no-inline";
import hitUrl from "@src/assets/sounds/files/sfx-hit.mp3?url&no-inline";
import type {SoundKey} from "@src/assets/sounds/types/SoundKey";

/** Where each sound's file is served from, by key. The build gives a file its own address, which is why they are imported. */
export const SOUND_URLS: Record<SoundKey, string> = {
  "sfx-empty-click": emptyClickUrl,
  "sfx-damage-crunch": damageCrunchUrl,
  "sfx-hit": hitUrl,
};
