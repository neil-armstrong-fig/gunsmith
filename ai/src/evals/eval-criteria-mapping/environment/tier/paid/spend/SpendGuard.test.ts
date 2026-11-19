import {mkdtempSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {SpendGuard} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/SpendGuard";
import {SpendLedger} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/SpendLedger";
import {finishedCall} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/testing/FinishedCall";
import {startedCall} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/testing/StartedCall";

it("adds what a finished call cost, from the tokens the model reported", () => {
  const spent = ledger(1);
  new SpendGuard(spent).handleLLMEnd(finishedCall(1_000_000, 1_000_000), "run-1");

  expect(spent.total()).toBeCloseTo(0.6, 10);
});

it("adds nothing for a call that reported no tokens", () => {
  const spent = ledger(1);
  new SpendGuard(spent).handleLLMEnd({generations: [[{text: ""}]]}, "run-1");

  expect(spent.total()).toBe(0);
});

it("lets a call start while there is room", () => {
  expect(() => startedCall(new SpendGuard(ledger(1)), "run-1")).not.toThrow();
});

it("stops a call from starting once the ceiling is reached", () => {
  const spent = ledger(0.5);
  spent.add(0.5);

  expect(() => startedCall(new SpendGuard(spent), "run-1")).toThrow("ceiling");
});

it("raises its error, so LangChain does not swallow the stop", () => {
  expect(new SpendGuard(ledger(1)).raiseError).toBe(true);
});

it("keeps the failure of a call that errored, so a run can say the model was not reached instead of that it drew badly", () => {
  const guard = new SpendGuard(ledger(1));
  guard.handleLLMError(new Error("400 invalid_request_error"), "run-1");

  expect(guard.takeFailure()).toBe("400 invalid_request_error");
});

it("hands a failure over once, then has none", () => {
  const guard = new SpendGuard(ledger(1));
  guard.handleLLMError(new Error("overloaded"), "run-1");
  guard.takeFailure();

  expect(guard.takeFailure()).toBeUndefined();
});

it("has no failure when every call finished", () => {
  expect(new SpendGuard(ledger(1)).takeFailure()).toBeUndefined();
});

it("keeps what each finished call used and why it stopped, so a run can tell a cut-off answer from a bad one", () => {
  const guard = new SpendGuard(ledger(1));
  guard.handleLLMEnd(finishedCall(300, 40, "tool_use"), "run-1");
  guard.handleLLMEnd(finishedCall(500, 1000, "max_tokens"), "run-2");

  expect(guard.takeCalls()).toEqual([
    {inputTokens: 300, outputTokens: 40, stopReason: "tool_use", stage: undefined, latencyMs: undefined},
    {inputTokens: 500, outputTokens: 1000, stopReason: "max_tokens", stage: undefined, latencyMs: undefined},
  ]);
});

it("records a call that gave no stop reason as having none", () => {
  const guard = new SpendGuard(ledger(1));
  guard.handleLLMEnd(finishedCall(10, 5), "run-1");

  expect(guard.takeCalls()).toEqual([expect.objectContaining({inputTokens: 10, stopReason: undefined})]);
});

it("names the stage of a call by the graph node it ran in, so budget can price moderation, generation and repair apart", () => {
  const guard = new SpendGuard(ledger(1));
  startedCall(guard, "run-1", "moderation");
  guard.handleLLMEnd(finishedCall(10, 5, "tool_use"), "run-1");
  startedCall(guard, "run-2", "generate");
  guard.handleLLMEnd(finishedCall(20, 6, "tool_use"), "run-2");

  expect(guard.takeCalls().map(({stage}) => stage)).toEqual(["moderation", "generate"]);
});

it("gives a call that ran outside any graph node no stage", () => {
  const guard = new SpendGuard(ledger(1));
  startedCall(guard, "run-1");
  guard.handleLLMEnd(finishedCall(10, 5, "tool_use"), "run-1");

  expect(guard.takeCalls().map(({stage}) => stage)).toEqual([undefined]);
});

it("times a call from its own start to its own end, so calls running together keep their own stage and latency", () => {
  let now = 1_000;
  const guard = new SpendGuard(ledger(1), () => now);
  startedCall(guard, "run-1", "moderation");
  now = 1_100;
  startedCall(guard, "run-2", "generate");
  now = 1_250;
  guard.handleLLMEnd(finishedCall(10, 5, "tool_use"), "run-2");
  now = 1_600;
  guard.handleLLMEnd(finishedCall(20, 6, "tool_use"), "run-1");

  expect(guard.takeCalls()).toEqual([
    expect.objectContaining({stage: "generate", latencyMs: 150}),
    expect.objectContaining({stage: "moderation", latencyMs: 600}),
  ]);
});

it("forgets a call that errored, so a later call with the same run id does not inherit its stage or latency", () => {
  const guard = new SpendGuard(ledger(1));
  startedCall(guard, "run-1", "moderation");
  guard.handleLLMError(new Error("overloaded"), "run-1");
  guard.handleLLMEnd(finishedCall(10, 5, "tool_use"), "run-1");

  expect(guard.takeCalls()).toEqual([expect.objectContaining({stage: undefined, latencyMs: undefined})]);
});

it("hands the calls over once, then has none", () => {
  const guard = new SpendGuard(ledger(1));
  guard.handleLLMEnd(finishedCall(10, 5, "tool_use"), "run-14");
  guard.takeCalls();

  expect(guard.takeCalls()).toEqual([]);
});

it("bills every call from every model that carries it into one ledger, the sum, not the last", () => {
  const spent = ledger(1);
  const guard = new SpendGuard(spent);
  guard.handleLLMEnd(finishedCall(1_000_000, 0), "run-15");
  guard.handleLLMEnd(finishedCall(0, 1_000_000), "run-16");

  expect(spent.total()).toBeCloseTo(0.6, 10);
});

it("keeps the stop as a failure too, so a request cut short by the ceiling is not read as a bad answer", () => {
  const spent = ledger(0.5);
  spent.add(0.5);
  const guard = new SpendGuard(spent);

  expect(() => startedCall(guard, "run-1")).toThrow("ceiling");
  expect(guard.takeFailure()).toContain("ceiling");
});

function ledger(ceilingDollars: number): SpendLedger {
  return new SpendLedger({file: join(mkdtempSync(join(tmpdir(), "guard-")), "ledger.json"), ceilingDollars});
}
