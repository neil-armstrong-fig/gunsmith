import {expect, it} from "vitest";
import {SeatTokenKeeper} from "@src/online/seat-token/SeatTokenKeeper";
import type {SeatTokenStorage} from "@src/online/seat-token/types/SeatTokenStorage";

class MemoryStorage implements SeatTokenStorage {
  readonly items = new Map<string, string>();

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
}

it("reads back what it saved for a room", () => {
  const storage = new MemoryStorage();
  new SeatTokenKeeper(() => storage, "ABC123").save("the-token");

  expect(new SeatTokenKeeper(() => storage, "ABC123").read()).toBe("the-token");
});

it("reads nothing before anything was saved", () => {
  expect(new SeatTokenKeeper(() => new MemoryStorage(), "ABC123").read()).toBeUndefined();
});

it("keeps one token for each room", () => {
  const storage = new MemoryStorage();
  new SeatTokenKeeper(() => storage, "ABC123").save("one");
  new SeatTokenKeeper(() => storage, "XYZ789").save("two");

  expect(new SeatTokenKeeper(() => storage, "ABC123").read()).toBe("one");
  expect(new SeatTokenKeeper(() => storage, "XYZ789").read()).toBe("two");
});

it("does not throw when the browser has no storage to give", () => {
  const keeper = new SeatTokenKeeper(() => {
    throw new Error("blocked");
  }, "ABC123");

  expect(() => {
    keeper.save("the-token");
  }).not.toThrow();
  expect(keeper.read()).toBeUndefined();
});
