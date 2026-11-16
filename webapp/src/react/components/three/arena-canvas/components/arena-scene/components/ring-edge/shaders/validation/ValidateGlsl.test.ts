import {validateGlsl} from "@src/react/components/three/arena-canvas/components/arena-scene/components/ring-edge/shaders/validation/ValidateGlsl";

it("accepts a fragment shader that is valid", () => {
  const result = validateGlsl({stage: "fragment", source: "void main() { gl_FragColor = vec4(1.0); }"});

  expect(result.log).toBe("");
  expect(result.valid).toBe(true);
});

it("accepts a vertex shader that uses what three.js declares for it", () => {
  const source = "void main() { gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0); }";

  expect(validateGlsl({stage: "vertex", source}).valid).toBe(true);
});

it("refuses a fragment shader that uses a name nothing declares, and says which", () => {
  const result = validateGlsl({stage: "fragment", source: "void main() { gl_FragColor = vec4(nothingDeclaredThis); }"});

  expect(result.valid).toBe(false);
  expect(result.log).toContain("nothingDeclaredThis");
});

it("refuses a vertex shader that is not valid GLSL", () => {
  const result = validateGlsl({stage: "vertex", source: "void main() { gl_Position = ; }"});

  expect(result.valid).toBe(false);
  expect(result.log).toContain("ERROR");
});

it("refuses a fragment shader that sets a vertex output, since the stage matters", () => {
  expect(validateGlsl({stage: "fragment", source: "void main() { gl_Position = vec4(1.0); }"}).valid).toBe(false);
});

it("does not give a fragment shader the vertex attribute, as three.js does not", () => {
  const result = validateGlsl({stage: "fragment", source: "void main() { gl_FragColor = vec4(position, 1.0); }"});

  expect(result.valid).toBe(false);
});

it("gives a fragment shader the camera declarations three.js gives it", () => {
  const result = validateGlsl({stage: "fragment", source: "void main() { gl_FragColor = vec4(cameraPosition, 1.0); }"});

  expect(result.valid).toBe(true);
});
