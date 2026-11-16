import {spawnSync} from "node:child_process";
import fragmentDeclarations from "@src/react/components/three/arena-canvas/components/arena-scene/components/ring-edge/shaders/validation/declarations/ThreeFragmentDeclarations.glsl?raw";
import vertexDeclarations from "@src/react/components/three/arena-canvas/components/arena-scene/components/ring-edge/shaders/validation/declarations/ThreeVertexDeclarations.glsl?raw";
import type {GlslStage} from "@src/react/components/three/arena-canvas/components/arena-scene/components/ring-edge/shaders/validation/types/GlslStage";
import type {GlslRequest} from "@src/react/components/three/arena-canvas/components/arena-scene/components/ring-edge/shaders/validation/types/GlslRequest";
import type {GlslValidation} from "@src/react/components/three/arena-canvas/components/arena-scene/components/ring-edge/shaders/validation/types/GlslValidation";

const DECLARATIONS: Record<GlslStage, string> = {vertex: vertexDeclarations, fragment: fragmentDeclarations};
const STAGE_FLAGS: Record<GlslStage, string> = {vertex: "vert", fragment: "frag"};

/**
 * Checks a shader with Khronos's `glslangValidator`, which must be on the PATH (`brew install glslang`; `apt install glslang-tools`).
 * three.js puts its own declarations (`modelMatrix`, `position` and the rest) ahead of a ShaderMaterial's source, so the same ones go in
 * front here, as GLSL ES 1.00, which is what three.js's own text translates from. This finds syntax and type errors without a browser;
 * that the shader draws what it should is for the acceptance spec.
 */
export function validateGlsl(request: GlslRequest): GlslValidation {
  const result = spawnSync("glslangValidator", ["--stdin", "-S", STAGE_FLAGS[request.stage]], {
    input: `${DECLARATIONS[request.stage]}\n${request.source}`,
    encoding: "utf8",
  });

  if (result.error) {
    throw new Error(
      `glslangValidator could not be run (${result.error.message}). Install it: brew install glslang (macOS) or apt install glslang-tools (Linux).`,
    );
  }

  return {valid: result.status === 0, log: `${result.stdout}${result.stderr}`.trim()};
}
