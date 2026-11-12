import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";
import type {Dummy} from "@gunsmith/engine/dummy/types/Dummy";

/** What a step of flying leaves behind: the bullets still in the air, and the dummies left standing, hurt or not. */
export interface BulletFlight {
  bullets: Bullet[];
  dummies: Dummy[];
}
