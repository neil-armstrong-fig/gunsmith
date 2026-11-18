import type {Step} from "@src/match/property-tests/match-room/arbitraries/types/Step";
import {SEATS} from "@src/match/property-tests/match-room/step-checks/Seats";
import {startedRoom} from "@src/match/property-tests/match-room/started-room/StartedRoom";

/** The inputs of `plan` played in one tick, or in the ticks `cutInto` cuts the same steps into, leave both seats in the same place and time. */
export function expectTheSameWhenCutUp(plan: Step[], cutInto: number[]): void {
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
