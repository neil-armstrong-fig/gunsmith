import type {RingCentreSnapshot} from "@gunsmith/shared/state-hook/types/RingCentreSnapshot";

/** The round's closing ring as the game reports it. */
export interface RingSnapshot {
  /** The seconds of the round still to be played before the ring starts to close; 0 once it has started. Falls only while the round is fought. */
  secondsUntilStart: number;
  /** The point the ring closes on: fixed for the round, drawn from the seed among the floor both fighters can walk to. */
  centre: RingCentreSnapshot;
  /** How far from the centre the safe ground reaches, in tiles: the whole arena until the ring starts, then shrinking to a small circle. It stops with the round. */
  radius: number;
  /** The health a fighter outside the ring loses each second right now: nothing until the ring starts, then rising until the ring has closed. */
  damagePerSecond: number;
}
