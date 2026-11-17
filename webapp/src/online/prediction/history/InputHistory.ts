import type {Input} from "@gunsmith/engine/game-loop/types/Input";

/**
 * What the browser asked for on each of its fixed steps, for the last `limit` steps, so the steps the server has not yet answered can be
 * played again on top of its word (`from`). Steps are numbered from zero as they are recorded; that number is the `seq` the browser sends.
 */
export class InputHistory {
  private readonly inputs: Input[] = [];
  private oldestStep = 0;

  constructor(private readonly limit: number) {}

  /** The number the next recorded step will have. */
  get nextStep(): number {
    return this.oldestStep + this.inputs.length;
  }

  /** Notes what was asked for on `step`, which must be the next step. The oldest is dropped when the history is full. */
  record(step: number, input: Input): void {
    if (step !== this.nextStep) {
      throw new Error(`Recorded step ${step} but the next is ${this.nextStep}.`);
    }

    this.inputs.push(input);
    if (this.inputs.length > this.limit) {
      this.inputs.shift();
      this.oldestStep += 1;
    }
  }

  /**
   * What was asked for from `step` up to the latest, oldest first: none when `step` has not been played yet, and `undefined` when
   * it is older than the history reaches, so the caller knows it cannot catch up and must take the server's word as it is.
   */
  from(step: number): readonly Input[] | undefined {
    if (step < this.oldestStep) {
      return undefined;
    }

    return this.inputs.slice(step - this.oldestStep);
  }
}
