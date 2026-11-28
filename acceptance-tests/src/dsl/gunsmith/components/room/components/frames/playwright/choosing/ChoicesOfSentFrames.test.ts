import {expect, it} from "vitest";
import {choicesOfSentFrames} from "@src/dsl/gunsmith/components/room/components/frames/playwright/choosing/ChoicesOfSentFrames";

it("reads a built-in weapon by its key and its slot", () => {
  const frame = JSON.stringify({kind: "choose", step: "weapon", slot: 2, choice: {kind: "builtIn", key: "rifle"}});

  expect(choicesOfSentFrames([frame])).toEqual([{step: "weapon", slot: 2, kind: "builtIn", reference: "rifle"}]);
});

it("reads a saved weapon by its id", () => {
  const frame = JSON.stringify({kind: "choose", step: "weapon", slot: 1, choice: {kind: "saved", id: "abc"}});

  expect(choicesOfSentFrames([frame])).toEqual([{step: "weapon", slot: 1, kind: "saved", reference: "abc"}]);
});

it("reads a built-in arena by its name and a saved arena by its id, with no slot", () => {
  const builtIn = JSON.stringify({kind: "choose", step: "arena", choice: {kind: "builtIn", name: "Duel"}});
  const saved = JSON.stringify({kind: "choose", step: "arena", choice: {kind: "saved", id: "yard"}});

  expect(choicesOfSentFrames([builtIn, saved])).toEqual([
    {step: "arena", slot: undefined, kind: "builtIn", reference: "Duel"},
    {step: "arena", slot: undefined, kind: "saved", reference: "yard"},
  ]);
});

it("keeps the order the choices were sent in", () => {
  const first = JSON.stringify({kind: "choose", step: "weapon", slot: 1, choice: {kind: "saved", id: "one"}});
  const second = JSON.stringify({kind: "choose", step: "weapon", slot: 2, choice: {kind: "saved", id: "two"}});

  expect(choicesOfSentFrames([first, second]).map(choice => choice.reference)).toEqual(["one", "two"]);
});

it("skips a lock-in, a frame that is not JSON and a choice that names nothing", () => {
  const lockIn = JSON.stringify({kind: "lockIn", step: "weapon", slot: 1});
  const nameless = JSON.stringify({kind: "choose", step: "weapon", slot: 1, choice: {kind: "saved"}});
  const unknownKind = JSON.stringify({kind: "choose", step: "weapon", slot: 1, choice: {kind: "other", id: "x"}});

  expect(choicesOfSentFrames([lockIn, "not json", nameless, unknownKind])).toEqual([]);
});
