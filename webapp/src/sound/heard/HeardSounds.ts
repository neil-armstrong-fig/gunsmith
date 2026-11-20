import type {CombatEvent} from "@gunsmith/engine/combat-events/types/CombatEvent";
import type {HeardSound} from "@gunsmith/engine/sound/types/HeardSound";
import type {SoundKey} from "@src/assets/sounds/types/SoundKey";
import {gainOfLoudness} from "@src/sound/spatial/GainOfLoudness";
import {panOfSector} from "@src/sound/spatial/PanOfSector";
import type {SoundOutput} from "@src/sound/types/SoundOutput";

/**
 * The cues for sounds heard from the other fighter. Shots and pickups use the same recordings as the player's cues.
 */
const FILE_OF_HEARD_SOUND: Partial<Record<HeardSound, SoundKey>> = {
  shot: "sfx-shot",
  step: "sfx-footstep",
  pickup: "sfx-pickup",
};

/**
 * Plays what the other fighter was heard doing, placed in the listener's ears: panned by the sector the engine says it came from
 * and quietened by its loudness. Nothing else is known of where it was (`HeardEvent` carries no place), so this cannot give more
 * away than the engine did.
 */
export class HeardSounds {
  constructor(private readonly output: SoundOutput) {}

  /** Plays each heard sound among `events`, in order. */
  play(events: readonly CombatEvent[] | undefined): void {
    for (const event of events ?? []) {
      if (event.kind !== "heard") {
        continue;
      }

      const file = FILE_OF_HEARD_SOUND[event.sound];
      if (file) {
        this.output.play(file, {pan: panOfSector(event.sector), gain: gainOfLoudness(event.loudness)});
      }
    }
  }
}
