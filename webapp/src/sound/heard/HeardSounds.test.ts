import type {CombatEvent} from "@gunsmith/engine/combat-events/types/CombatEvent";
import {HeardSounds} from "@src/sound/heard/HeardSounds";
import type {PlayOptions} from "@src/sound/types/PlayOptions";
import type {SoundOutput} from "@src/sound/types/SoundOutput";

interface Play {
  key: string;
  options: PlayOptions | undefined;
}

class RecordingOutput implements SoundOutput {
  readonly plays: Play[] = [];

  play(key: string, options?: PlayOptions): void {
    this.plays.push({key, options});
  }

  startLoop(): void {}

  stopLoop(): void {}

  stopAll(): void {}
}

it("plays a weapon heard being taken with the pickup's sound, panned to its side and at its loudness", () => {
  const output = new RecordingOutput();

  new HeardSounds(output).play([{kind: "heard", sound: "pickup", sector: 6, loudness: "far"}]);

  expect(output.plays).toEqual([{key: "sfx-pickup", options: {pan: -1, gain: 0.2}}]);
});

it("plays each pickup heard, in order, each from its own side", () => {
  const output = new RecordingOutput();
  const events: CombatEvent[] = [
    {kind: "heard", sound: "pickup", sector: 2, loudness: "near"},
    {kind: "heard", sound: "pickup", sector: 6, loudness: "mid"},
  ];

  new HeardSounds(output).play(events);

  expect(output.plays.map(play => play.options?.pan)).toEqual([1, -1]);
});

it("plays heard shots and feet with their direction and loudness", () => {
  const output = new RecordingOutput();

  new HeardSounds(output).play([
    {kind: "heard", sound: "shot", sector: 2, loudness: "near"},
    {kind: "heard", sound: "step", sector: 4, loudness: "mid"},
  ]);

  expect(output.plays).toEqual([
    {key: "sfx-shot", options: {pan: 1, gain: 1}},
    {key: "sfx-footstep", options: {pan: 0, gain: 0.5}},
  ]);
});

it("plays nothing for what happened to the listener themselves, or for no events", () => {
  const output = new RecordingOutput();
  const sounds = new HeardSounds(output);

  sounds.play([{kind: "pickupTaken"}, {kind: "hitLanded", on: "opponent"}]);
  sounds.play(undefined);

  expect(output.plays).toEqual([]);
});
