import {mkdtempSync, readFileSync, existsSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {SpendGuard} from "@evals/eval-criteria-mapping/tier/paid/spend/SpendGuard";
import {SpendLedger} from "@evals/eval-criteria-mapping/tier/paid/spend/SpendLedger";
import {finishedCall} from "@evals/eval-criteria-mapping/tier/paid/spend/testing/FinishedCall";
import {runPaidWeapon} from "@evals/eval-criteria-mapping/weapon/paid/RunPaidWeapon";
import type {PaidWeaponRunOptions} from "@evals/eval-criteria-mapping/weapon/paid/types/PaidWeaponRunOptions";
import {createWeaponPipelineDriver} from "@evals/eval-criteria-mapping/weapon/CreateWeaponPipelineDriver";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";

interface Setup {
  options: PaidWeaponRunOptions;
  ledger: SpendLedger;
  guard: SpendGuard;
  logFile: string;
  pipelineRuns: () => number;
}

/** A run whose pipeline "makes" the calls it is given by finishing them on the guard, as the real models would. */
async function setup(makeCalls: (guard: SpendGuard) => void, ceilingDollars = 1): Promise<Setup> {
  const folder = mkdtempSync(join(tmpdir(), "paid-weapon-"));
  const ledger = new SpendLedger({file: join(folder, "ledger.json"), ceilingDollars});
  const guard = new SpendGuard(ledger);
  const outcome = await createWeaponPipelineDriver("fake", undefined).run("a mild rifle");
  let runs = 0;

  const options: PaidWeaponRunOptions = {
    ledger,
    guard,
    logFile: join(folder, "calls.jsonl"),
    pipeline: (): Promise<WeaponOutcome> => {
      runs += 1;
      makeCalls(guard);

      return Promise.resolve(outcome);
    },
  };

  return {options, ledger, guard, logFile: options.logFile, pipelineRuns: () => runs};
}

function loggedLines(file: string): unknown[] {
  return readFileSync(file, "utf8")
    .trim()
    .split("\n")
    .map((line): unknown => JSON.parse(line));
}

it("returns what the pipeline returned, and logs the request with every call it made", async () => {
  const {options, logFile} = await setup(guard => {
    guard.handleLLMEnd(finishedCall(300, 5, "tool_use"));
    guard.handleLLMEnd(finishedCall(500, 60, "tool_use"));
  });

  const outcome = await runPaidWeapon("a mild rifle", options);

  expect(outcome.status).toBe("created");
  expect(loggedLines(logFile)).toEqual([
    {
      at: expect.any(String),
      prompt: "a mild rifle",
      durationMs: expect.any(Number),
      statsCalls: 2,
      calls: [
        {inputTokens: 300, outputTokens: 5, stopReason: "tool_use"},
        {inputTokens: 500, outputTokens: 60, stopReason: "tool_use"},
      ],
    },
  ]);
});

it("does not start the request once the ceiling is reached, and says so", async () => {
  const {options, ledger, pipelineRuns} = await setup(() => undefined, 0.5);
  ledger.add(0.5);

  await expect(runPaidWeapon("a mild rifle", options)).rejects.toThrow("ceiling");
  expect(pipelineRuns()).toBe(0);
});

it("fails the run, saying the model was not reached, when a call errored, instead of passing a rejection off as the model's", async () => {
  const {options} = await setup(guard => {
    guard.handleLLMError(new Error("400 invalid_request_error"));
  });

  await expect(runPaidWeapon("a mild rifle", options)).rejects.toThrow(
    "A paid model call failed, so this result says nothing about the weapon: 400 invalid_request_error",
  );
});

it("fails the run when an answer was cut off at its token limit, instead of passing it off as a bad weapon", async () => {
  const {options} = await setup(guard => {
    guard.handleLLMEnd(finishedCall(500, 1000, "max_tokens"));
  });

  await expect(runPaidWeapon("a mild rifle", options)).rejects.toThrow("cut off at its token limit");
});

it("still logs the calls of a run it then fails, because they are what explains the failure", async () => {
  const {options, logFile} = await setup(guard => {
    guard.handleLLMEnd(finishedCall(500, 1000, "max_tokens"));
  });

  await runPaidWeapon("a mild rifle", options).catch(() => undefined);

  expect(loggedLines(logFile)).toEqual([
    expect.objectContaining({calls: [{inputTokens: 500, outputTokens: 1000, stopReason: "max_tokens"}]}),
  ]);
});

it("writes no log line for a request it never started", async () => {
  const {options, ledger, logFile} = await setup(() => undefined, 0.5);
  ledger.add(0.5);

  await runPaidWeapon("a mild rifle", options).catch(() => undefined);

  expect(existsSync(logFile)).toBe(false);
});

it("does not carry one request's calls into the next", async () => {
  const {options, logFile} = await setup(guard => {
    guard.handleLLMEnd(finishedCall(10, 5, "tool_use"));
  });

  await runPaidWeapon("first", options);
  await runPaidWeapon("second", options);

  expect(loggedLines(logFile)).toEqual([
    expect.objectContaining({prompt: "first", calls: [expect.objectContaining({inputTokens: 10})]}),
    expect.objectContaining({prompt: "second", calls: [expect.objectContaining({inputTokens: 10})]}),
  ]);
});
