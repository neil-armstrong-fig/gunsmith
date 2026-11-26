import {existsSync, mkdtempSync, readFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {runPaidRequest} from "@evals/eval-criteria-mapping/environment/tier/paid/run/RunPaidRequest";
import type {PaidRequestOptions} from "@evals/eval-criteria-mapping/environment/tier/paid/run/types/PaidRequestOptions";
import {SpendGuard} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/SpendGuard";
import {SpendLedger} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/SpendLedger";
import {finishedCall} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/testing/FinishedCall";
import {startedCall} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/testing/StartedCall";

interface Answer {
  text: string;
}

interface Setup {
  options: PaidRequestOptions<Answer>;
  ledger: SpendLedger;
  guard: SpendGuard;
  logFile: string;
  pipelineRuns: () => number;
}

it("returns what the pipeline returned, and logs the request with every call it made and the stage of each", async () => {
  const {options, logFile} = setup(guard => {
    startedCall(guard, "run-1", "moderation");
    guard.handleLLMEnd(finishedCall(300, 5, "tool_use"), "run-1");
    startedCall(guard, "run-2", "generate");
    guard.handleLLMEnd(finishedCall(500, 60, "tool_use"), "run-2");
  });

  const outcome = await runPaidRequest("a mild rifle", options);

  expect(outcome.text).toBe("answered");
  expect(loggedLines(logFile)).toEqual([
    {
      at: expect.any(String),
      prompt: "a mild rifle",
      durationMs: expect.any(Number),
      calls: [
        {inputTokens: 300, outputTokens: 5, stopReason: "tool_use", stage: "moderation", latencyMs: expect.any(Number)},
        {inputTokens: 500, outputTokens: 60, stopReason: "tool_use", stage: "generate", latencyMs: expect.any(Number)},
      ],
    },
  ]);
});

it("gives a call that ran in no graph node the stage the run names, because the appearance drawing runs in no graph", async () => {
  const {options, logFile} = setup(
    guard => {
      startedCall(guard, "run-1");
      guard.handleLLMEnd(finishedCall(300, 5, "tool_use"), "run-1");
    },
    1,
    "draw",
  );

  await runPaidRequest("a lantern", options);

  expect(loggedLines(logFile)).toEqual([expect.objectContaining({calls: [expect.objectContaining({stage: "draw"})]})]);
});

it("keeps the stage a graph node gave a call over the one the run names", async () => {
  const {options, logFile} = setup(
    guard => {
      startedCall(guard, "run-1", "repair");
      guard.handleLLMEnd(finishedCall(300, 5, "tool_use"), "run-1");
    },
    1,
    "moderation",
  );

  await runPaidRequest("a ring of pillars", options);

  expect(loggedLines(logFile)).toEqual([
    expect.objectContaining({calls: [expect.objectContaining({stage: "repair"})]}),
  ]);
});

it("does not start the request once the ceiling is reached, and says so", async () => {
  const {options, ledger, pipelineRuns} = setup(() => undefined, 0.5);
  ledger.add(0.5);

  await expect(runPaidRequest("a mild rifle", options)).rejects.toThrow("ceiling");
  expect(pipelineRuns()).toBe(0);
});

it("fails the run, saying the model was not reached, when a call errored, instead of passing a rejection off as the model's", async () => {
  const {options} = setup(guard => {
    guard.handleLLMError(new Error("400 invalid_request_error"), "run-1");
  });

  await expect(runPaidRequest("a mild rifle", options)).rejects.toThrow(
    "A paid model call failed, so this result says nothing about the weapon: 400 invalid_request_error",
  );
});

it("fails the run when an answer was cut off at its token limit, instead of passing it off as a bad weapon", async () => {
  const {options} = setup(guard => {
    guard.handleLLMEnd(finishedCall(500, 1000, "max_tokens"), "run-1");
  });

  await expect(runPaidRequest("a mild rifle", options)).rejects.toThrow("cut off at its token limit");
});

it("still logs the calls of a run it then fails, because they are what explains the failure", async () => {
  const {options, logFile} = setup(guard => {
    guard.handleLLMEnd(finishedCall(500, 1000, "max_tokens"), "run-1");
  });

  await runPaidRequest("a mild rifle", options).catch(() => undefined);

  expect(loggedLines(logFile)).toEqual([
    expect.objectContaining({calls: [expect.objectContaining({inputTokens: 500, stopReason: "max_tokens"})]}),
  ]);
});

it("writes no log line for a request it never started", async () => {
  const {options, ledger, logFile} = setup(() => undefined, 0.5);
  ledger.add(0.5);

  await runPaidRequest("a mild rifle", options).catch(() => undefined);

  expect(existsSync(logFile)).toBe(false);
});

it("does not carry one request's calls into the next", async () => {
  const {options, logFile} = setup(guard => {
    guard.handleLLMEnd(finishedCall(10, 5, "tool_use"), "run-1");
  });

  await runPaidRequest("first", options);
  await runPaidRequest("second", options);

  expect(loggedLines(logFile)).toEqual([
    expect.objectContaining({prompt: "first", calls: [expect.objectContaining({inputTokens: 10})]}),
    expect.objectContaining({prompt: "second", calls: [expect.objectContaining({inputTokens: 10})]}),
  ]);
});

function loggedLines(file: string): unknown[] {
  return readFileSync(file, "utf8")
    .trim()
    .split("\n")
    .map((line): unknown => JSON.parse(line));
}

/** A run whose pipeline "makes" the calls it is given by finishing them on the guard, as the real models would. */
function setup(makeCalls: (guard: SpendGuard) => void, ceilingDollars = 1, defaultStage?: string): Setup {
  const folder = mkdtempSync(join(tmpdir(), "paid-request-"));
  const ledger = new SpendLedger({file: join(folder, "ledger.json"), ceilingDollars});
  const guard = new SpendGuard(ledger);
  let runs = 0;

  const options: PaidRequestOptions<Answer> = {
    ledger,
    guard,
    logFile: join(folder, "calls.jsonl"),
    subject: "the weapon",
    defaultStage,
    run: (): Promise<Answer> => {
      runs += 1;
      makeCalls(guard);

      return Promise.resolve({text: "answered"});
    },
  };

  return {options, ledger, guard, logFile: options.logFile, pipelineRuns: () => runs};
}
