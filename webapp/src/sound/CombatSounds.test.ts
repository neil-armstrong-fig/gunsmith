import {CombatSounds} from "@src/sound/CombatSounds";
import type {PlayOptions} from "@src/sound/types/PlayOptions";
import type {SoundOutput} from "@src/sound/types/SoundOutput";
import type {TickCues} from "@src/sound/types/TickCues";

class RecordingOutput implements SoundOutput {
  readonly played: string[] = [];
  readonly placed: (PlayOptions | undefined)[] = [];
  readonly loopStarts: string[] = [];
  readonly loopStops: string[] = [];
  stops = 0;

  play(key: string, options?: PlayOptions): void {
    this.played.push(key);
    this.placed.push(options);
  }

  startLoop(key: string): void {
    this.loopStarts.push(key);
  }

  stopLoop(key: string): void {
    this.loopStops.push(key);
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
  expect(output.loopStarts).toEqual([]);
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

it("requests the ring loop for damage in a playing round and stops it when damage ceases or the round ends", () => {
  const output = new RecordingOutput();
  const sounds = new CombatSounds(output);
  const ring: TickCues = {...EMPTY_CLICK, events: [{kind: "damageTaken", cause: "ring", amount: 0.2}], firing: false};

  sounds.afterTick(ring);
  sounds.afterTick({...ring, events: undefined});
  sounds.afterTick(ring);
  sounds.afterTick({...ring, round: "lost"});

  expect(output.loopStarts).toEqual(["sfx-ring-damage-loop", "sfx-ring-damage-loop"]);
  expect(output.loopStops).toEqual(["sfx-ring-damage-loop", "sfx-ring-damage-loop"]);
  expect(output.played).toEqual([]);
});

it("requests no ring loop for a bullet, nor for a step with nothing in it", () => {
  const output = new RecordingOutput();
  const sounds = new CombatSounds(output);

  sounds.afterTick({...EMPTY_CLICK, events: [{kind: "damageTaken", cause: "bullet", amount: 20}], firing: false});
  sounds.afterTick({...EMPTY_CLICK, events: undefined, firing: false});

  expect(output.loopStarts).toEqual([]);
});

it("plays the click and the crunch when a step has both", () => {
  const output = new RecordingOutput();

  new CombatSounds(output).afterTick({
    ...EMPTY_CLICK,
    events: [...(EMPTY_CLICK.events ?? []), {kind: "damageTaken", cause: "bullet", amount: 20}],
  });

  expect(output.played).toEqual(["sfx-empty-click", "sfx-damage-crunch"]);
});

it("plays the hit confirmation for a bullet that landed on a target the player saw", () => {
  const output = new RecordingOutput();

  new CombatSounds(output).afterTick({...EMPTY_CLICK, events: [{kind: "hitLanded", on: "opponent"}], firing: false});

  expect(output.played).toEqual(["sfx-hit"]);
});

it("plays the crunch and the hit confirmation as two cues when the players hurt each other in one step", () => {
  const output = new RecordingOutput();

  new CombatSounds(output).afterTick({
    ...EMPTY_CLICK,
    events: [
      {kind: "damageTaken", cause: "bullet", amount: 20},
      {kind: "hitLanded", on: "opponent"},
    ],
    firing: false,
  });

  expect(output.played).toEqual(["sfx-damage-crunch", "sfx-hit"]);
});

it("plays the other fighter's pickup, panned and quietened, and the player's own pickup in the middle at full volume", () => {
  const output = new RecordingOutput();
  const sounds = new CombatSounds(output);

  sounds.afterTick({...EMPTY_CLICK, firing: false, events: [{kind: "pickupTaken"}]});
  sounds.afterTick({
    ...EMPTY_CLICK,
    firing: false,
    events: [{kind: "heard", sound: "pickup", sector: 2, loudness: "mid"}],
  });

  expect(output.played).toEqual(["sfx-pickup", "sfx-pickup"]);
  expect(output.placed).toEqual([undefined, {pan: 1, gain: 0.5}]);
});
