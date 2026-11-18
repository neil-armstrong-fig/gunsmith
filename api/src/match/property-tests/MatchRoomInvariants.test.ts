import fc from "fast-check";
import type {Seat} from "@gunsmith/engine/seat/types/Seat";
import type {InputAck} from "@gunsmith/shared/online/types/InputAck";
import {MatchRoom} from "@src/match/room/MatchRoom";
import {steps} from "@src/match/property-tests/arbitraries/Steps";
import type {Step} from "@src/match/property-tests/arbitraries/types/Step";

/**
 * What must hold for any input a browser could send and any clock, not only the ones someone wrote down. `MatchRoom.test.ts` says what one
 * input does; this puts random sequences of inputs and ticks through a room and says what is true of every one. When a property fails,
 * fast-check shrinks the case and prints a seed to replay it. The parser has its own (`ParseInputMessageInvariants.test.ts`).
 *
 * Deliberately outside `pnpm checks`: a fresh seed each run means a failure is not reproducible from the same commit
 * (`vitest.config.ts`). Run it with `pnpm test:properties`; `PROPERTY_TEST_RUNS` sets how many cases each property gets.
 */
const RUNS = Number(process.env["PROPERTY_TEST_RUNS"] ?? 100);

const SEATS: readonly Seat[] = ["first", "second"];

/** Every field a snapshot may carry. Anything else (a dummy, the opponent's brain, the combat events) is the server's alone and must never be sent. */
const ALLOWED_SNAPSHOT_FIELDS = [
  "kind",
  "player",
  "opponent",
  "bullets",
  "pickup",
  "ring",
  "match",
  "round",
  "elapsedSeconds",
  "ack",
  "ready",
];

it("tells a seat the newest input it has sent and how many steps were played with it, never going back", () => {
  fc.assert(fc.property(steps(), expectAckToFollowTheInputs), {numRuns: RUNS});
});

it("plays the steps it is told the same however they are cut up, when nothing new is asked in between", () => {
  fc.assert(fc.property(steps(), cuts(), expectTheSameWhenCutUp), {numRuns: RUNS});
});

it("sends a seat only the fields it may know, whatever has been asked and played", () => {
  fc.assert(fc.property(steps(), expectOnlyAllowedFields), {numRuns: RUNS});
});

function expectAckToFollowTheInputs(plan: Step[]): void {
  const room = startedRoom();
  let reached: Record<Seat, InputAck | undefined> = {first: undefined, second: undefined};

  for (const step of plan) {
    reached = play(room, step, reached);

    for (const seat of SEATS) {
      expect(room.snapshotFor(seat)?.ack).toEqual(reached[seat]);
    }
  }
}

function expectTheSameWhenCutUp(plan: Step[], cutInto: number[]): void {
  const whole = startedRoom();
  const cut = startedRoom();
  for (const step of plan) {
    if (step.kind === "input") {
      whole.setInput(step.seat, step.input, step.seq);
      cut.setInput(step.seat, step.input, step.seq);
    }
  }

  whole.tick(cutInto.reduce((total, owed) => total + owed, 0));
  for (const owed of cutInto) {
    cut.tick(owed);
  }

  for (const seat of SEATS) {
    expect(cut.snapshotFor(seat)?.player.position).toEqual(whole.snapshotFor(seat)?.player.position);
    expect(cut.snapshotFor(seat)?.elapsedSeconds).toBeCloseTo(whole.snapshotFor(seat)?.elapsedSeconds ?? NaN, 9);
  }
}

function expectOnlyAllowedFields(plan: Step[]): void {
  const room = startedRoom();
  for (const step of plan) {
    play(room, step, {first: undefined, second: undefined});
  }

  for (const seat of SEATS) {
    const sent = JSON.parse(JSON.stringify(room.snapshotFor(seat))) as Record<string, unknown>;

    for (const field of Object.keys(sent)) {
      expect(ALLOWED_SNAPSHOT_FIELDS).toContain(field);
    }
  }
}

function startedRoom(): MatchRoom {
  const room = new MatchRoom();
  room.join();
  room.join();

  return room;
}

/** Ways to cut a stretch of owed steps into ticks. */
function cuts(): fc.Arbitrary<number[]> {
  return fc.array(fc.integer({min: 1, max: 6}), {minLength: 1, maxLength: 6});
}

/** Plays one step on the room, and says where each seat's input count should stand after it, worked out here from the step alone. */
function play(
  room: MatchRoom,
  step: Step,
  reached: Record<Seat, InputAck | undefined>,
): Record<Seat, InputAck | undefined> {
  if (step.kind === "tick") {
    room.tick(step.steps);

    return {first: heldFor(reached.first, step.steps), second: heldFor(reached.second, step.steps)};
  }

  room.setInput(step.seat, step.input, step.seq);
  const before = reached[step.seat];
  if (before && step.seq < before.seq) {
    return reached;
  }

  return {...reached, [step.seat]: {seq: step.seq, held: 0}};
}

function heldFor(reached: InputAck | undefined, steps: number): InputAck | undefined {
  if (!reached || steps <= 0) {
    return reached;
  }

  return {seq: reached.seq, held: reached.held + steps};
}
