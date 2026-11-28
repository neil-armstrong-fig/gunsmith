import type {ArenaPipelineDriver} from "@evals/dsl/arena/types/ArenaPipelineDriver";
import type {ArenaEvaluator} from "@evals/dsl/arena/pipeline/types/ArenaEvaluator";
import {arenaAnswered} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaAnswered";
import {arenaIsItsOwn} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaIsItsOwn";
import {arenaKeepsCover} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaKeepsCover";
import {arenaNodePath} from "@evals/dsl/arena/pipeline/evaluators/outcome/ArenaNodePath";
import {playableArena} from "@evals/dsl/arena/pipeline/evaluators/playable/PlayableArena";
import {arenaNameHygiene} from "@evals/dsl/arena/pipeline/evaluators/player-visible/ArenaNameHygiene";
import {arenaNoPromptLeak} from "@evals/dsl/arena/pipeline/evaluators/player-visible/ArenaNoPromptLeak";
import {failuresOf} from "@evals/dsl/shared/checks/FailuresOf";
import {walledCorners} from "@evals/dsl/arena/pipeline/walled-corners/WalledCorners";
import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import type {ArenaSize} from "@gunsmith/ai/pipeline/arena/drafting/format/shapes/types/ArenaSize";
import type {ArenaOutcomeStatus} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcomeStatus";

/**
 * The arena pipeline as seen from outside, the system under test: the one class that knows how to put a request through it and
 * how to read what came back, as `WeaponPipeline` is for weapons. `ask` runs the request once and holds the answer; each
 * `check…` runs pure evaluators over it, throwing one sentence per check that failed and why (a criterion holds only if it held in every
 * trial, and each trial is a scope of its own, so that is the mapping's). It catches nothing and wraps
 * nothing: the DSL says what was being attempted.
 */
export class ArenaPipeline {
  private readonly driver: ArenaPipelineDriver;
  private answered: ArenaOutcome | undefined;

  constructor(driver: ArenaPipelineDriver) {
    this.driver = driver;
  }

  /** Puts a player's request through the pipeline, replacing any earlier answer. */
  async ask(prompt: string): Promise<void> {
    this.answered = await this.driver.run(prompt);
  }

  /** How the request ended: an arena created, the request rejected, or no arena made and a reason given (invalid). */
  statusOfTheAnswer(): ArenaOutcomeStatus {
    return this.theAnswer().status;
  }

  /** The model calls the request cost, all stages together. */
  modelCallsOfTheAnswer(): number {
    return this.theAnswer().modelCalls;
  }

  /** The output tokens the models reported for the whole request, all calls together, or nothing when the pipeline reported no usage. */
  outputTokensOfTheAnswer(): number | undefined {
    return this.theAnswer().usage?.outputTokens;
  }

  /** Whether the credit went back. */
  refundOfTheAnswer(): boolean {
    return this.theAnswer().refunded;
  }

  arenaAnsweredProblems(): string[] {
    return this.problemsOf([arenaAnswered]);
  }

  coverProblems(): string[] {
    return this.problemsOf([arenaKeepsCover]);
  }

  ownArenaProblems(): string[] {
    return this.problemsOf([arenaIsItsOwn]);
  }

  /** How many tiles wide and tall the arena the player was given is, read from its drawing, or nothing when no drawing was given. */
  sizeOfTheAnswer(): ArenaSize | undefined {
    const rows = this.rowsOfTheAnswer();
    if (!rows) return undefined;

    return {width: rows[0]?.length ?? 0, height: rows.length};
  }

  /** The highest level of raised floor in the arena the player was given, read from its drawing (0 for low ground only), or nothing when no drawing was given. */
  highestLevelOfTheAnswer(): number | undefined {
    const rows = this.rowsOfTheAnswer();
    if (!rows) return undefined;

    const levels = rows.join("").match(/[12]/g) ?? [];

    return Math.max(0, ...levels.map(Number));
  }

  nameProblems(): string[] {
    return this.problemsOf([arenaNameHygiene]);
  }

  promptLeakProblems(): string[] {
    return this.problemsOf([arenaNoPromptLeak]);
  }

  safeToShowProblems(): string[] {
    return this.problemsOf([playableArena, arenaNoPromptLeak]);
  }

  /** How many of the four corners of the arena the player was given are walled in (`walledCorners`), or nothing when no drawing was given. */
  walledCornersOfTheAnswer(): number | undefined {
    const rows = this.rowsOfTheAnswer();
    if (!rows) return undefined;

    return walledCorners(rows);
  }

  fixedPathProblems(): string[] {
    return this.problemsOf([arenaNodePath]);
  }

  private theAnswer(): ArenaOutcome {
    if (!this.answered) {
      throw new Error("Ask for an arena (in a beforeAll) before expecting anything");
    }

    return this.answered;
  }

  /** The rows of the drawing the player was given, or nothing when no drawing was given. */
  private rowsOfTheAnswer(): string[] | undefined {
    const {arena} = this.theAnswer();
    if (typeof arena !== "object" || arena === null || !("rows" in arena) || !Array.isArray(arena.rows)) {
      return undefined;
    }

    return arena.rows.map(String);
  }

  private problemsOf(checks: ArenaEvaluator[]): string[] {
    return failuresOf({outcome: this.theAnswer()}, checks);
  }
}
