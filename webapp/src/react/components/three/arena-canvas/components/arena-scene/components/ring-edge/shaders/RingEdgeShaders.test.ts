import ringEdgeFragmentShader from "@src/react/components/three/arena-canvas/components/arena-scene/components/ring-edge/shaders/RingEdgeFragment.glsl?raw";
import ringEdgeVertexShader from "@src/react/components/three/arena-canvas/components/arena-scene/components/ring-edge/shaders/RingEdgeVertex.glsl?raw";
import {validateGlsl} from "@src/react/components/three/arena-canvas/components/arena-scene/components/ring-edge/shaders/validation/ValidateGlsl";

it("has a vertex shader that compiles", () => {
  const result = validateGlsl({stage: "vertex", source: ringEdgeVertexShader});

  expect(result.log).not.toContain("ERROR");
  expect(result.valid).toBe(true);
});

it("has a fragment shader that compiles", () => {
  const result = validateGlsl({stage: "fragment", source: ringEdgeFragmentShader});

  expect(result.log).not.toContain("ERROR");
  expect(result.valid).toBe(true);
});

it("has a fragment shader that reads what the vertex shader passes it", () => {
  expect(ringEdgeVertexShader).toContain("varying vec2 vArenaPlace;");
  expect(ringEdgeFragmentShader).toContain("varying vec2 vArenaPlace;");
});
