import type {Point} from "@src/dsl/gunsmith/types/Point";

export interface AimedPoint extends Point {
  aimDegrees: number;
}
