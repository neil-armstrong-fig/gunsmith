import type {Page} from "@playwright/test";
import {expect, it} from "vitest";
import {wireOfPage} from "@src/dsl/gunsmith/components/room/playwright/wire/room-wire/WireOfPage";

it("gives every part of the room on one page the same wire", () => {
  const page = {} as Page;

  expect(wireOfPage(page)).toBe(wireOfPage(page));
});

it("gives another browser's page a wire of its own", () => {
  const first = {} as Page;
  const second = {} as Page;

  expect(wireOfPage(first)).not.toBe(wireOfPage(second));
});
