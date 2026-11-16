import type {Bullet} from "@gunsmith/engine/bullet/types/Bullet";

export interface BulletAtRequest {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  changes?: Partial<Bullet>;
}
