import {mkdtempSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {SpendGuard} from "@evals/eval-criteria-mapping/tier/paid/spend/SpendGuard";
import {SpendLedger} from "@evals/eval-criteria-mapping/tier/paid/spend/SpendLedger";
import {finishedCall} from "@evals/eval-criteria-mapping/tier/paid/spend/testing/FinishedCall";

it("adds what a finished call cost, from the tokens the model reported", () => {
  const spent = ledger(1);
  new SpendGuard(spent).handleLLMEnd(finishedCall(1_000_000, 1_000_000));

  expect(spent.total()).toBeCloseTo(0.6, 10);
});

it("adds nothing for a call that reported no tokens", () => {
  const spent = ledger(1);
  new SpendGuard(spent).handleLLMEnd({generations: [[{text: ""}]]});

  expect(spent.total()).toBe(0);
});

it("lets a call start while there is room", () => {
  expect(() => new SpendGuard(ledger(1)).handleChatModelStart()).not.toThrow();
});

it("stops a call from starting once the ceiling is reached", () => {
  const spent = ledger(0.5);
  spent.add(0.5);

  expect(() => new SpendGuard(spent).handleChatModelStart()).toThrow("ceiling");
});

it("raises its error, so LangChain does not swallow the stop", () => {
  expect(new SpendGuard(ledger(1)).raiseError).toBe(true);
});

it("keeps the failure of a call that errored, so a run can say the model was not reached instead of that it drew badly", () => {
  const guard = new SpendGuard(ledger(1));
  guard.handleLLMError(new Error("400 invalid_request_error"));

  expect(guard.takeFailure()).toBe("400 invalid_request_error");
});

it("hands a failure over once, then has none", () => {
  const guard = new SpendGuard(ledger(1));
  guard.handleLLMError(new Error("overloaded"));
  guard.takeFailure();

  expect(guard.takeFailure()).toBeUndefined();
});

it("has no failure when every call finished", () => {
  expect(new SpendGuard(ledger(1)).takeFailure()).toBeUndefined();
});

it("keeps what each finished call used and why it stopped, so a run can tell a cut-off answer from a bad one", () => {
  const guard = new SpendGuard(ledger(1));
  guard.handleLLMEnd(finishedCall(300, 40, "tool_use"));
  guard.handleLLMEnd(finishedCall(500, 1000, "max_tokens"));

  expect(guard.takeCalls()).toEqual([
    {inputTokens: 300, outputTokens: 40, stopReason: "tool_use"},
    {inputTokens: 500, outputTokens: 1000, stopReason: "max_tokens"},
  ]);
});

it("records a call that gave no stop reason as having none", () => {
  const guard = new SpendGuard(ledger(1));
  guard.handleLLMEnd(finishedCall(10, 5));

  expect(guard.takeCalls()).toEqual([{inputTokens: 10, outputTokens: 5, stopReason: undefined}]);
});

it("hands the calls over once, then has none", () => {
  const guard = new SpendGuard(ledger(1));
  guard.handleLLMEnd(finishedCall(10, 5, "tool_use"));
  guard.takeCalls();

  expect(guard.takeCalls()).toEqual([]);
});

it("bills every call from every model that carries it into one ledger, the sum, not the last", () => {
  const spent = ledger(1);
  const guard = new SpendGuard(spent);
  guard.handleLLMEnd(finishedCall(1_000_000, 0));
  guard.handleLLMEnd(finishedCall(0, 1_000_000));

  expect(spent.total()).toBeCloseTo(0.6, 10);
});

it("keeps the stop as a failure too, so a request cut short by the ceiling is not read as a bad answer", () => {
  const spent = ledger(0.5);
  spent.add(0.5);
  const guard = new SpendGuard(spent);

  expect(() => guard.handleChatModelStart()).toThrow("ceiling");
  expect(guard.takeFailure()).toContain("ceiling");
});

function ledger(ceilingDollars: number): SpendLedger {
  return new SpendLedger({file: join(mkdtempSync(join(tmpdir(), "guard-")), "ledger.json"), ceilingDollars});
}
