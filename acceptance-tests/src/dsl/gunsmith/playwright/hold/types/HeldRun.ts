import type {HurtWatch} from "@src/dsl/gunsmith/types/HurtWatch";

/** What `runHeldUntil` runs a held game for. */
export interface HeldRun {
  /** How long to run, and in what steps. */
  watch: HurtWatch;
  /** What the run waits for, for the message when it does not come. */
  what: string;
  /** Whether it has happened; asked after every step. */
  isDone: () => Promise<boolean>;
}
