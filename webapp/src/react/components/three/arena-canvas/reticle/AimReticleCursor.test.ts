import {readFileSync} from "node:fs";
import aimReticleUrl from "@src/react/components/three/arena-canvas/reticle/AimReticle.png";
import {aimReticleCursor} from "@src/react/components/three/arena-canvas/reticle/AimReticleCursor";
import {expect, it} from "vitest";

/** A PNG file starts with an eight-byte signature, then the header chunk: its width and height are the next big-endian numbers. */
function pngSizeOf(file: Buffer): {width: number; height: number} {
  return {width: file.readUInt32BE(16), height: file.readUInt32BE(20)};
}

it("puts the mouse position at the middle of the real picture", () => {
  const {width, height} = pngSizeOf(readFileSync(new URL("AimReticle.png", import.meta.url)));

  expect(aimReticleCursor).toContain(`") ${width / 2} ${height / 2}, `);
});

it("uses the reticle picture", () => {
  expect(aimReticleCursor.startsWith(`url("${aimReticleUrl}")`)).toBe(true);
});

it("ends with the browser's crosshair, the fallback CSS requires", () => {
  expect(aimReticleCursor.endsWith(", crosshair")).toBe(true);
});
