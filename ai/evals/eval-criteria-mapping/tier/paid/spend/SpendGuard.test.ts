import {mkdtempSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {AIMessage} from "@langchain/core/messages";
import type {ChatGeneration, LLMResult} from "@langchain/core/outputs";
import {SpendGuard} from "@evals/eval-criteria-mapping/tier/paid/spend/SpendGuard";
import {SpendLedger} from "@evals/eval-criteria-mapping/tier/paid/spend/SpendLedger";

function ledger(ceilingDollars: number): SpendLedger {
  return new SpendLedger({file: join(mkdtempSync(join(tmpdir(), "guard-")), "ledger.json"), ceilingDollars});
}

function finishedCall(inputTokens: number, outputTokens: number): LLMResult {
  const message = new AIMessage({
    content: "",
    usage_metadata: {input_tokens: inputTokens, output_tokens: outputTokens, total_tokens: inputTokens + outputTokens},
  });
  const generation: ChatGeneration = {text: "", message};

  return {generations: [[generation]]};
}

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
