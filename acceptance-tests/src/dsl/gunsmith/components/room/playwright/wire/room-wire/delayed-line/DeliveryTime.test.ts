import {expect, it} from "vitest";
import {deliveryTime} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/delayed-line/DeliveryTime";

it("delivers a frame its delay after it was sent", () => {
  expect(deliveryTime({index: 0, sentAt: 1000, delay: {milliseconds: 300}})).toBe(1300);
});

it("adds jitter in a fixed pattern up to the most it may add", () => {
  const delay = {milliseconds: 100, jitterMilliseconds: 100};

  expect(deliveryTime({index: 1, sentAt: 0, delay})).toBeCloseTo(170);
  expect(deliveryTime({index: 3, sentAt: 0, delay})).toBe(200);
  expect(deliveryTime({index: 8, sentAt: 0, delay})).toBe(100);
});

it("never delivers a frame before the one ahead of it", () => {
  const delay = {milliseconds: 100, jitterMilliseconds: 100};

  expect(deliveryTime({index: 2, sentAt: 10, previousDeliveryAt: 500, delay})).toBe(500);
});
