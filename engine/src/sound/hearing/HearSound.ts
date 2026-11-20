import type {HeardEvent} from "@gunsmith/engine/combat-events/types/HeardEvent";
import type {Point} from "@gunsmith/engine/geometry/types/Point";
import {sectorOf} from "@gunsmith/engine/sound/direction/SectorOf";
import {HEARING_RANGES} from "@gunsmith/engine/sound/hearing/HearingRanges";
import {loudnessOf} from "@gunsmith/engine/sound/loudness/LoudnessOf";
import type {HeardSound} from "@gunsmith/engine/sound/types/HeardSound";

/**
 * What a listener at `listener` hears of `sound` made at `source`: the sound, the direction it came from and how loud it was, or
 * nothing when it was made beyond that sound's range (`HEARING_RANGES`). Walls do not muffle it. Only the direction and one of three
 * loudnesses leave (`HeardEvent`), never the place.
 */
export function hearSound(listener: Point, source: Point, sound: HeardSound): HeardEvent | undefined {
  const distance = Math.hypot(source.x - listener.x, source.y - listener.y);
  const range = HEARING_RANGES[sound];
  if (distance > range) {
    return undefined;
  }

  return {kind: "heard", sound, sector: sectorOf(listener, source), loudness: loudnessOf(distance, range)};
}
