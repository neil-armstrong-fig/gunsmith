# Shaders: how they are written, checked and tested

Decided 2026-11-15, when the closing ring got the game's first shader (`webapp/src/react/components/three/arena-canvas/components/arena-scene/components/ring-edge/`).

## Written as `.glsl` files

A shader is a `.glsl` file imported as a string with Vite's `?raw`, never a string inside a `.ts` file, so the editor can colour
it and a reader can find it. The import is named in full (`ringEdgeVertexShader`, `ringEdgeFragmentShader`). `vite/client` is in the
webapp's `tsconfig`, which is what types `?raw`. Prettier skips the files (it has no GLSL support); formatting them was
considered and skipped as not worth a tool for about thirty lines (`clang-format` is the usual substitute if they grow).

Editor support (from memory, **not verified**; check the Marketplace for what is maintained): `slevesque.shader` for colour,
`dtoplak.vscode-glsllint` to run `glslangValidator` as you type, `antaalt.shader-validator` as a newer language server.

## Checked by `glslangValidator`, inside `pnpm checks`

Khronos's compiler, run from a Vitest test (`ring-edge/shaders/RingEdgeShaders.test.ts`, helper `validation/ValidateGlsl.ts`), so it runs
wherever the webapp's unit tests do. **It must be on the PATH:** `brew install glslang` (macOS, glslang 16.6.0 when added) or
`apt install glslang-tools` (Linux, and the CI runner when `ci.yml` exists). A missing tool fails the test with those words. It follows
what `webapp/audio` already does with `ffmpeg`: a system tool, not an npm dependency (the npm packages found were stale: the
prebuilt wrappers are from 2022, and `@webgpu/glslang` compiles to SPIR-V for Vulkan, which, to my understanding and unverified, does not
accept the GLSL ES 1.00 that three.js's ShaderMaterial source translates from).

three.js puts its own declarations (`modelMatrix`, `position`, `projectionMatrix`, `viewMatrix`, `cameraPosition`...) ahead of a
ShaderMaterial's source, so a validator that sees the file alone reports them as undeclared. The test prepends the same ones as `#version 100`
declaration files (`validation/declarations/ThreeVertexDeclarations.glsl`, `ThreeFragmentDeclarations.glsl`), a different set per stage: the
fragment stage has no `attribute`. If three.js starts declaring something else a shader uses, add it there. Proved able to fail: nine
mutants (a misspelt keyword, an undeclared uniform, a wrong type, a missing semicolon, an unknown built-in, a validator that always or never
says valid, one that drops the declarations, one that checks the wrong stage) were each caught.

## Tested in the browser

`DrawingTheClosingRing` (acceptance spec) reads what a player sees, because the canvas is not in the DOM and WebGL's drawing buffer is cleared
after each frame: a screenshot, decoded in the page, read at the places the state hook says the ring is (a bright red line at the edge, untinted
ground at the centre, tinted ground just outside), and no shader error in the console (three.js logs one when a program fails to link). The mapping
from a place in tiles to a pixel assumes the camera fits the arena to the window and centres it (`ZoomToFit`); if that changes, the spec fails and
says so. Six mutants (a shader that does not compile, no tint outside, a blue edge, an inside that is tinted too, a radius never written, an edge
drawn in the wrong place) were each caught by the right criteria.

## Unit-testing the maths of a shader without a browser: decided against, for now

Research (a quick search, 2026-11-15, thin): no mature way to run GLSL in plain Node. `glsl-testify` writes tests inside GLSL but opens a
browser window; for WGSL, one three.js forum thread shows a plain test-runner approach that needs no GPU, which does not transfer to GLSL;
`headless-gl` and an ANGLE-based headless context were not evaluated. three.js's own repository tests its shader chunks as text and by compiling.
**Decision:** the ring's shader is about thirty lines with no logic worth isolating (a distance and two comparisons), and the compile check
plus the pixel spec cover what can go wrong, so no standalone shader unit tests. **Revisit if** a shader grows real logic (noise, lighting, blending
rules): then either move the maths into a TypeScript function the shader mirrors and test that, or evaluate a headless WebGL context in Vitest.

## One gotcha

The radius and centre are written to the `ShaderMaterial` the renderer holds (`materialRef.current.uniforms`), not to the object passed as
`uniforms={...}`: writing the second left the radius at 0 and tinted the whole arena. The pixel spec catches it (a mutant that never wrote the radius is killed).
