import assert from "node:assert/strict";
import {it} from "node:test";
import {mixTimeline} from "@gunsmith/audio-studies/output/mix/timeline/MixTimeline";

it("has thirty-six events: twelve in each of three repeats", () => {
  assert.equal(mixTimeline().length, 36);
});

it("opens each repeat with the pickup, reload, ring warning and hit, and then walks", () => {
  const first = mixTimeline().slice(0, 12);

  assert.deepEqual(first.slice(0, 4), [
    {at: 1.2, key: "sfx-pickup"},
    {at: 4.1, key: "sfx-reload"},
    {at: 7.2, key: "sfx-ring-warning"},
    {at: 12.3, key: "sfx-hit"},
  ]);
  assert.ok(first.slice(4).every(event => event.key.startsWith("sfx-step-")));
});

it("alternates a standing and a crouched footfall, four of each, one variant at a time", () => {
  const steps = mixTimeline().slice(4, 12);

  assert.deepEqual(
    steps.map(event => event.key),
    [
      "sfx-step-stand",
      "sfx-step-crouch",
      "sfx-step-stand-02",
      "sfx-step-crouch-02",
      "sfx-step-stand-03",
      "sfx-step-crouch-03",
      "sfx-step-stand-04",
      "sfx-step-crouch-04",
    ],
  );
});

it("spaces standing steps 0.42 seconds apart from 2, and crouched steps 0.65 apart from 9.5", () => {
  const steps = mixTimeline().slice(4, 12);
  const stand = steps.filter(event => event.key.includes("stand"));
  const crouch = steps.filter(event => event.key.includes("crouch"));

  assert.deepEqual(
    stand.map(event => event.at),
    [2, 2 + 0.42, 2 + 2 * 0.42, 2 + 3 * 0.42],
  );
  assert.deepEqual(
    crouch.map(event => event.at),
    [9.5, 9.5 + 0.65, 9.5 + 2 * 0.65, 9.5 + 3 * 0.65],
  );
});

it("repeats the same run every 30 seconds", () => {
  const events = mixTimeline();

  for (const repeat of [1, 2]) {
    const again = events.slice(repeat * 12, repeat * 12 + 12);

    assert.deepEqual(
      again.map(event => event.key),
      events.slice(0, 12).map(event => event.key),
    );
    for (const [index, event] of again.entries()) {
      const first = events[index];
      assert.ok(first && Math.abs(event.at - (first.at + repeat * 30)) < 1e-9);
    }
  }
});
