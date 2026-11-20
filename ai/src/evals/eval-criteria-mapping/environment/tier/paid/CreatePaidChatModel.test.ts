import {createPaidChatModel} from "@evals/eval-criteria-mapping/environment/tier/paid/CreatePaidChatModel";
import {paidSpendGuard} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/PaidSpendGuard";

beforeEach(() => {
  vi.stubEnv("ANTHROPIC_API_KEY", "a-key-for-a-test-that-calls-nothing");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

it("never retries a failed call, because a retry the spend guard cannot see would hide an attempt from the ledger and the log", () => {
  // LangChain keeps the retry count protected on the caller that makes the call, so it is read by name.
  expect(Reflect.get(createPaidChatModel(2000).caller, "maxRetries")).toBe(0);
});

it("carries the one spend guard, so every paid call is added into the one ledger", () => {
  expect(createPaidChatModel(2000).callbacks).toEqual([paidSpendGuard()]);
});

it("limits the answer to the tokens it is given", () => {
  expect(createPaidChatModel(1234).maxTokens).toBe(1234);
});
