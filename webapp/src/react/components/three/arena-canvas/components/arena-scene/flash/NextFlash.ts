import type {Flash} from "@src/react/components/three/arena-canvas/components/arena-scene/flash/types/Flash";
import type {FlashRequest} from "@src/react/components/three/arena-canvas/components/arena-scene/flash/types/FlashRequest";
import {BURST_SECONDS} from "@src/sound/burst-window/BurstSeconds";

/**
 * Where the flash of a hit stands after one frame. A hit flashes at once, at age 0. A hit that lands within `BURST_SECONDS` of the flash already running
 * (the same 100 ms the crunch merges bullets in) is merged into it: it does not start another, and does not move the start, so a burst is one flash.
 * Several hits seen in one frame are one flash too. Pure: the time is the frame's own, so nothing here reads a clock.
 */
export function nextFlash({flash, hits, seconds}: FlashRequest): Flash {
  const age = flash.age + seconds;

  if (hits === flash.hitsSeen) {
    return {hitsSeen: hits, age};
  }

  if (flash.age < BURST_SECONDS) {
    return {hitsSeen: hits, age};
  }

  return {hitsSeen: hits, age: 0};
}
