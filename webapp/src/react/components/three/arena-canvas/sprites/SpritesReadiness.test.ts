import {beforeEach, expect, it, vi} from "vitest";
import {spritesReadiness} from "@src/react/components/three/arena-canvas/sprites/SpritesReadiness";

beforeEach(() => {
  spritesReadiness.forget();
});

it("is not ready before the loads have been requested, though none is under way", () => {
  expect(spritesReadiness.areReady()).toBe(false);
});

it("is ready once the loads are requested and none is under way", () => {
  spritesReadiness.markRequested();

  expect(spritesReadiness.areReady()).toBe(true);
});

it("is not ready while a load is under way, and is when it settles", async () => {
  let finish: () => void = () => undefined;
  const tracked = spritesReadiness.trackLoad(
    new Promise<void>(resolve => {
      finish = resolve;
    }),
  );
  spritesReadiness.markRequested();

  expect(spritesReadiness.areReady()).toBe(false);

  finish();
  await tracked;

  expect(spritesReadiness.areReady()).toBe(true);
});

it("counts a load that fails as settled, so one missing picture cannot hold the page", async () => {
  const tracked = spritesReadiness.trackLoad(Promise.reject(new Error("no such file")));
  spritesReadiness.markRequested();

  await expect(tracked).rejects.toThrow("no such file");
  expect(spritesReadiness.areReady()).toBe(true);
});

it("waits for every load, not just the first to settle", async () => {
  let finishSecond: () => void = () => undefined;
  const first = spritesReadiness.trackLoad(Promise.resolve());
  const second = spritesReadiness.trackLoad(
    new Promise<void>(resolve => {
      finishSecond = resolve;
    }),
  );
  spritesReadiness.markRequested();
  await first;

  expect(spritesReadiness.areReady()).toBe(false);

  finishSecond();
  await second;

  expect(spritesReadiness.areReady()).toBe(true);
});

it("tells a listener when a load settles, and stops when it is unsubscribed", async () => {
  const listener = vi.fn();
  const unsubscribe = spritesReadiness.subscribe(listener);

  await spritesReadiness.trackLoad(Promise.resolve());
  expect(listener).toHaveBeenCalledTimes(1);

  unsubscribe();
  await spritesReadiness.trackLoad(Promise.resolve());

  expect(listener).toHaveBeenCalledTimes(1);
});
