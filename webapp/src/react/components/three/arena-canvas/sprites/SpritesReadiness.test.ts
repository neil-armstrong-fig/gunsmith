import {beforeEach, expect, it, vi} from "vitest";
import {
  areSpritesReady,
  forgetSprites,
  markSpritesRequested,
  subscribeToSprites,
  trackLoad,
} from "@src/react/components/three/arena-canvas/sprites/SpritesReadiness";

beforeEach(() => {
  forgetSprites();
});

it("is not ready before the loads have been requested, though none is under way", () => {
  expect(areSpritesReady()).toBe(false);
});

it("is ready once the loads are requested and none is under way", () => {
  markSpritesRequested();

  expect(areSpritesReady()).toBe(true);
});

it("is not ready while a load is under way, and is when it settles", async () => {
  let finish: () => void = () => undefined;
  const tracked = trackLoad(
    new Promise<void>(resolve => {
      finish = resolve;
    }),
  );
  markSpritesRequested();

  expect(areSpritesReady()).toBe(false);

  finish();
  await tracked;

  expect(areSpritesReady()).toBe(true);
});

it("counts a load that fails as settled, so one missing picture cannot hold the page", async () => {
  const tracked = trackLoad(Promise.reject(new Error("no such file")));
  markSpritesRequested();

  await expect(tracked).rejects.toThrow("no such file");
  expect(areSpritesReady()).toBe(true);
});

it("waits for every load, not just the first to settle", async () => {
  let finishSecond: () => void = () => undefined;
  const first = trackLoad(Promise.resolve());
  const second = trackLoad(
    new Promise<void>(resolve => {
      finishSecond = resolve;
    }),
  );
  markSpritesRequested();
  await first;

  expect(areSpritesReady()).toBe(false);

  finishSecond();
  await second;

  expect(areSpritesReady()).toBe(true);
});

it("tells a listener when a load settles, and stops when it is unsubscribed", async () => {
  const listener = vi.fn();
  const unsubscribe = subscribeToSprites(listener);

  await trackLoad(Promise.resolve());
  expect(listener).toHaveBeenCalledTimes(1);

  unsubscribe();
  await trackLoad(Promise.resolve());

  expect(listener).toHaveBeenCalledTimes(1);
});
