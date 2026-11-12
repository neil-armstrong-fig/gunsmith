import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Dummy} from "@gunsmith/engine/dummy/types/Dummy";

/** What `advanceBullets` is asked to do: fly these bullets on for this long, past these dummies. */
export interface FlightRequest {
  bullets: readonly Bullet[];
  dummies: readonly Dummy[];
  seconds: number;
}
