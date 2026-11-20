import {paidModelOptions} from "@evals/eval-criteria-mapping/environment/tier/paid/PaidModelOptions";
import {paidSpendGuard} from "@evals/eval-criteria-mapping/environment/tier/paid/spend/PaidSpendGuard";

beforeEach(() => {
  vi.stubEnv("ANTHROPIC_API_KEY", "a-key-for-a-test-that-calls-nothing");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

it("carries the one spend guard, so every paid call is added into the one ledger", () => {
  expect(paidModelOptions().callbacks).toEqual([paidSpendGuard()]);
});

it("hands over the key the environment holds", () => {
  expect(paidModelOptions().apiKey).toBe("a-key-for-a-test-that-calls-nothing");
});
