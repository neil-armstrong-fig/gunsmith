import {CombatSounds} from "@src/sound/CombatSounds";
import type {SoundOutput} from "@src/sound/types/SoundOutput";
import type {TickCues} from "@src/sound/types/TickCues";

class RecordingOutput implements SoundOutput {
  readonly played: string[] = [];
  stops = 0;

  play(key: string): void {
    this.played.push(key);
  }

  stopAll(): void {
    this.stops += 1;
  }
}

const EMPTY_CLICK: TickCues = {
  events: [{kind: "fireRefused", reason: "empty"}],
  firing: true,
  round: "playing",
  seconds: 1 / 60,
};

it("plays the empty click for a refused trigger", () => {
  const output = new RecordingOutput();

  new CombatSounds(output).afterTick(EMPTY_CLICK);

  expect(output.played).toEqual(["sfx-empty-click"]);
});

it("plays nothing for a step with no events", () => {
  const output = new RecordingOutput();

  new CombatSounds(output).afterTick({...EMPTY_CLICK, events: undefined});

  expect(output.played).toEqual([]);
});

it("plays one click for a hold across many steps", () => {
  const output = new RecordingOutput();
  const sounds = new CombatSounds(output);

  sounds.afterTick(EMPTY_CLICK);
  sounds.afterTick(EMPTY_CLICK);
  sounds.afterTick(EMPTY_CLICK);

  expect(output.played).toEqual(["sfx-empty-click"]);
});

it("stops what is playing when told to cancel, and wants a fresh press after", () => {
  const output = new RecordingOutput();
  const sounds = new CombatSounds(output);

  sounds.cancel();
  sounds.afterTick(EMPTY_CLICK);

  expect(output.stops).toBe(1);
  expect(output.played).toEqual([]);
});

it("plays the crunch for a bullet that hurt the player", () => {
  const output = new RecordingOutput();

  new CombatSounds(output).afterTick({
    ...EMPTY_CLICK,
    events: [{kind: "damageTaken", cause: "bullet", amount: 20}],
    firing: false,
  });

  expect(output.played).toEqual(["sfx-damage-crunch"]);
});

it("plays one crunch while the ring keeps hurting", () => {
  const output = new RecordingOutput();
  const sounds = new CombatSounds(output);
  const ring: TickCues = {...EMPTY_CLICK, events: [{kind: "damageTaken", cause: "ring", amount: 0.2}], firing: false};

  sounds.afterTick(ring);
  sounds.afterTick(ring);
  sounds.afterTick(ring);

  expect(output.played).toEqual(["sfx-damage-crunch"]);
});

it("plays the click and the crunch when a step has both", () => {
  const output = new RecordingOutput();

  new CombatSounds(output).afterTick({
    ...EMPTY_CLICK,
    events: [...(EMPTY_CLICK.events ?? []), {kind: "damageTaken", cause: "bullet", amount: 20}],
  });

  expect(output.played).toEqual(["sfx-empty-click", "sfx-damage-crunch"]);
});
