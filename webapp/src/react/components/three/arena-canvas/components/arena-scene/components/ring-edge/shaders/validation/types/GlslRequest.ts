import type {GlslStage} from "@src/react/components/three/arena-canvas/components/arena-scene/components/ring-edge/shaders/validation/types/GlslStage";

/** A shader to check: which stage it is for, and its source as written in its `.glsl` file (without three.js's own declarations). */
export interface GlslRequest {
  stage: GlslStage;
  source: string;
}
