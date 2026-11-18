import type {PngSize} from "@src/react/components/three/arena-canvas/reticle/types/PngSize";
import {readFileSync} from "node:fs";
import aimReticleUrl from "@src/react/components/three/arena-canvas/reticle/AimReticle.png";
import aimReticleSharpUrl from "@src/react/components/three/arena-canvas/reticle/AimReticleSharp.png";
import {aimReticleCursor} from "@src/react/components/three/arena-canvas/reticle/AimReticleCursor";
import {expect, it} from "vitest";

it("puts the mouse position at the middle of the ordinary picture, in CSS pixels", () => {
  const {width, height} = pngSizeOf(readFileSync(new URL("AimReticle.png", import.meta.url)));

  expect(aimReticleCursor).toContain(` 2x) ${width / 2} ${height / 2}, `);
});

it("has a sharp picture exactly twice as big, so the same hotspot is its middle too", () => {
  const ordinary = pngSizeOf(readFileSync(new URL("AimReticle.png", import.meta.url)));
  const sharp = pngSizeOf(readFileSync(new URL("AimReticleSharp.png", import.meta.url)));

  expect(sharp).toEqual({width: ordinary.width * 2, height: ordinary.height * 2});
});

it("offers the ordinary picture at 1x and the sharp one at 2x", () => {
  expect(aimReticleCursor.startsWith(`image-set(url("${aimReticleUrl}") 1x, url("${aimReticleSharpUrl}") 2x) `)).toBe(
    true,
  );
});

it("ends with the browser's crosshair, the fallback CSS requires", () => {
  expect(aimReticleCursor.endsWith(", crosshair")).toBe(true);
});

/** A PNG file starts with an eight-byte signature, then the header chunk: its width and height are the next big-endian numbers. */
function pngSizeOf(file: Buffer): PngSize {
  return {width: file.readUInt32BE(16), height: file.readUInt32BE(20)};
}
