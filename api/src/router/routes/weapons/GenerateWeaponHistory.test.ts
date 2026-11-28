import {fallbackAppearance} from "@gunsmith/shared/appearance/fallback/FallbackAppearance";
import * as generatedItems from "@src/shared/accounts/keep-generated-item/KeepGeneratedItem";
import * as history from "@src/shared/accounts/keep-generation-attempt/KeepGenerationAttempt";
import {removeAccount} from "@src/shared/accounts/remove-account/RemoveAccount";
import {insertUser} from "@src/shared/accounts/testing/local-database/InsertUser";
import {DAILY_CREDITS} from "@src/durable-objects/credit-ledger/account/DailyCredits";
import {WEAPON_SPEND} from "@src/durable-objects/spend-ledger/estimate/weapon/WeaponSpend";
import {PIPELINE_TIME_LIMIT_MILLISECONDS} from "@src/router/routes/shared/time-limit/PipelineTimeLimit";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/weapon/types/WeaponOutcome";
import {rowsOf} from "@src/shared/accounts/testing/local-database/RowsOf";
import {useLocalDatabase} from "@src/shared/accounts/testing/local-database/UseLocalDatabase";
import {workerEnvironment} from "@src/shared/env/WorkerEnvironment";
import {generationHistoryRedaction} from "@src/router/routes/shared/generation-history/privacy/GenerationHistoryRedaction";
import type {GenerationHistoryRedaction} from "@src/router/routes/shared/generation-history/types/GenerationHistoryRedaction";
import {signInPlayer} from "@src/router/routes/shared/fake-accounts/SignInPlayer";
import {fakeLedgers} from "@src/router/routes/shared/fake-ledgers/FakeLedgers";
import {generateWeaponRoute} from "@src/router/routes/weapons/GenerateWeaponRoute";
import {runWeaponPipeline} from "@src/router/routes/weapons/pipeline/RunWeaponPipeline";

vi.unmock("@src/shared/accounts/account-of-session/AccountOfSession");
vi.unmock("@src/shared/accounts/create-session/CreateSession");
vi.unmock("@src/shared/accounts/find-or-create-account/FindOrCreateAccount");
vi.unmock("@src/shared/accounts/keep-generated-item/KeepGeneratedItem");
vi.unmock("@src/shared/accounts/remove-account/RemoveAccount");
vi.mock("@src/router/routes/shared/generation-history/privacy/GenerationHistoryRedaction", {spy: true});

const emptyDatabase = useLocalDatabase();
const prompt = "  A rifle for the arena.\n";
const repairedWeapon = {
  status: "created",
  weapon: {name: "Practice rifle"},
  nodes: ["precheck", "moderation", "generate", "validate", "repair", "validate", "balance", "draw"],
  modelCalls: 4,
  history: {pipelineVersion: "weapon-v1", relevance: "accepted", codeEdits: 2, modelRepairs: 1},
} satisfies WeaponOutcome;

beforeEach(() => {
  workerEnvironment.GENERATION_HISTORY_CAPTURE = "true";
});

it("records the original prompt once when making a weapon succeeds after repair", async () => {
  const database = await emptyDatabase();
  const {cookie} = await signInPlayer();
  fakeLedgers();
  vi.mocked(runWeaponPipeline).mockResolvedValue(repairedWeapon);

  const response = await makeWeapon(cookie);

  expect(await response.json()).toEqual({id: expect.any(String), status: "created", weapon: repairedWeapon.weapon});
  expect(
    await rowsOf(
      database,
      "SELECT kind, outcome, prompt, pipeline_version, code_edits, model_repairs FROM generation_attempts",
    ),
  ).toEqual([
    {
      kind: "weapon",
      outcome: "repaired-success",
      prompt,
      pipeline_version: "weapon-v1",
      code_edits: 2,
      model_repairs: 1,
    },
  ]);
});

it("keeps the attempt and replaces the personal details in its prompt", async () => {
  const database = await emptyDatabase();
  const {cookie} = await signInPlayer();
  fakeLedgers();
  vi.mocked(runWeaponPipeline).mockResolvedValue(repairedWeapon);

  expect((await makeWeapon(cookie, "A pistol engraved with jane.doe@example.com, call +44 7700 900123")).status).toBe(
    200,
  );
  expect(
    await rowsOf(
      database,
      "SELECT kind, outcome, prompt, pipeline_version, code_edits, model_repairs FROM generation_attempts",
    ),
  ).toEqual([
    {
      kind: "weapon",
      outcome: "repaired-success",
      prompt: "A pistol engraved with [email], call [phone]",
      pipeline_version: "weapon-v1",
      code_edits: 2,
      model_repairs: 1,
    },
  ]);
});

it("records a stored weapon with a built-in drawing as success with fallback and charges one credit", async () => {
  const database = await emptyDatabase();
  const {account, cookie} = await signInPlayer();
  const ledgers = fakeLedgers();
  const appearance = {
    status: "fallback" as const,
    appearance: fallbackAppearance(),
    changes: [],
    errors: ["synthetic drawing failure"],
    nodes: ["generate", "repair", "fallback"],
    modelCalls: 2,
    usage: {inputTokens: 0, outputTokens: 0},
  };
  vi.mocked(runWeaponPipeline).mockResolvedValue({
    ...repairedWeapon,
    appearance,
    history: {...repairedWeapon.history, modelRepairs: 2},
  });

  const response = await makeWeapon(cookie);

  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    id: expect.any(String),
    status: "created",
    weapon: repairedWeapon.weapon,
    appearance: appearance.appearance,
  });
  expect(ledgers.accountOf(account.id).balance(Date.now())).toBe(DAILY_CREDITS - 1);
  expect(await attemptResults(database)).toEqual([
    {outcome: "success-with-fallback", prompt, failure_stage: null, failure_reason: null},
  ]);
  expect(await rowsOf(database, "SELECT model_repairs FROM generation_attempts")).toEqual([{model_repairs: 2}]);
});

it("records first-pass success without prompt text when redaction fails", async () => {
  const database = await emptyDatabase();
  const {cookie} = await signInPlayer();
  fakeLedgers();
  const redaction = vi.fn<GenerationHistoryRedaction>(() => {
    throw new Error(prompt);
  });
  vi.mocked(generationHistoryRedaction).mockReturnValueOnce(redaction);
  vi.mocked(runWeaponPipeline).mockResolvedValue({
    ...repairedWeapon,
    history: {...repairedWeapon.history, codeEdits: 0, modelRepairs: 0},
  });

  expect((await makeWeapon(cookie)).status).toBe(200);
  expect(redaction).toHaveBeenCalledExactlyOnceWith(prompt);
  expect(await attemptResults(database)).toEqual([
    {outcome: "first-pass-success", prompt: null, failure_stage: null, failure_reason: null},
  ]);
});

it.each([
  {relevance: "not-judged", stage: "precheck", reason: "precheck-refused", calls: 0},
  {relevance: "irrelevant", stage: "moderation", reason: "irrelevant", calls: 1},
  {relevance: "unavailable", stage: "moderation", reason: "unavailable", calls: 1},
] as const)("records a rejected weapon request with relevance $relevance and its prompt", async example => {
  const database = await emptyDatabase();
  const {account, cookie} = await signInPlayer();
  const ledgers = fakeLedgers();
  vi.mocked(runWeaponPipeline).mockResolvedValue({
    status: "rejected",
    reason: "synthetic refusal",
    nodes: ["precheck"],
    modelCalls: example.calls,
    history: {...repairedWeapon.history, relevance: example.relevance, codeEdits: 0, modelRepairs: 0},
  });

  const response = await makeWeapon(cookie);

  expect(await response.json()).toEqual({status: "rejected", reason: "synthetic refusal"});
  expect(ledgers.accountOf(account.id).balance(Date.now())).toBe(DAILY_CREDITS - example.calls * 0.5);
  expect(await attemptResults(database)).toEqual([
    {outcome: "rejected", prompt, failure_stage: example.stage, failure_reason: example.reason},
  ]);
});

it("records AI-off as a blocked attempt without keeping the unjudged prompt", async () => {
  const database = await emptyDatabase();
  const {cookie} = await signInPlayer();
  const ledgers = fakeLedgers({aiOn: false});
  const redaction = vi.fn<GenerationHistoryRedaction>();
  vi.mocked(generationHistoryRedaction).mockReturnValueOnce(redaction);

  expect((await makeWeapon(cookie)).status).toBe(503);
  expect(ledgers.calls).toEqual(["status"]);
  expect(runWeaponPipeline).not.toHaveBeenCalled();
  expect(redaction).not.toHaveBeenCalled();
  expect(await attemptResults(database)).toEqual([
    {outcome: "blocked", prompt: null, failure_stage: "spend", failure_reason: "ai-off"},
  ]);
});

it("records an invalid weapon using the closed validation reason", async () => {
  const database = await emptyDatabase();
  const {cookie} = await signInPlayer();
  const ledgers = fakeLedgers();
  vi.mocked(runWeaponPipeline).mockResolvedValue({
    status: "invalid",
    reason: "synthetic validation error",
    nodes: repairedWeapon.nodes,
    modelCalls: 3,
    history: {...repairedWeapon.history, validationFailure: "rating-out-of-bounds"},
  });

  expect(await (await makeWeapon(cookie)).json()).toEqual({status: "invalid", reason: "synthetic validation error"});
  expect(ledgers.calls).toContain("settle:unusable");
  expect(await attemptResults(database)).toEqual([
    {outcome: "failed", prompt, failure_stage: "validation", failure_reason: "rating-out-of-bounds"},
  ]);
});

it("records a pipeline exception with a closed reason and refunds the credit", async () => {
  const database = await emptyDatabase();
  const {account, cookie} = await signInPlayer();
  const ledgers = fakeLedgers();
  vi.mocked(runWeaponPipeline).mockRejectedValue(new Error(prompt));

  const response = await makeWeapon(cookie);

  expect(response.status).toBe(502);
  expect(await response.json()).toEqual({error: "generation-failed"});
  expect(ledgers.accountOf(account.id).balance(Date.now())).toBe(DAILY_CREDITS);
  expect(ledgers.spendMeter.spentThisMonth()).toBe(WEAPON_SPEND.reservedMicrodollars);
  expect(await attemptResults(database)).toEqual([
    {outcome: "failed", prompt: null, failure_stage: "pipeline", failure_reason: "generation-failed"},
  ]);
});

it("records a timeout once even when the weapon pipeline completes late", async () => {
  const database = await emptyDatabase();
  const {account, cookie} = await signInPlayer();
  const ledgers = fakeLedgers();
  let markStarted: (signal: AbortSignal) => void = () => undefined;
  const started = new Promise<AbortSignal>(resolve => {
    markStarted = resolve;
  });
  let finish: (outcome: WeaponOutcome) => void = () => undefined;
  const finished = new Promise<WeaponOutcome>(resolve => {
    finish = resolve;
  });
  vi.mocked(runWeaponPipeline).mockImplementation((_prompt, signal) => {
    markStarted(signal);

    return finished;
  });
  vi.useFakeTimers({toFake: ["setTimeout", "clearTimeout"]});
  try {
    const pending = makeWeapon(cookie);
    const signal = await started;
    await vi.advanceTimersByTimeAsync(PIPELINE_TIME_LIMIT_MILLISECONDS);

    expect((await pending).status).toBe(504);
    expect(signal.aborted).toBe(true);
    finish(repairedWeapon);
    await vi.advanceTimersByTimeAsync(0);
    expect(ledgers.calls).toEqual(["status", "reserve:weapon", "spend:reserve", "spend:settle", "refund"]);
    expect(ledgers.accountOf(account.id).balance(Date.now())).toBe(DAILY_CREDITS);
    expect(ledgers.spendMeter.spentThisMonth()).toBe(WEAPON_SPEND.reservedMicrodollars);
    expect(await attemptResults(database)).toEqual([
      {outcome: "failed", prompt: null, failure_stage: "pipeline", failure_reason: "generation-timed-out"},
    ]);
  } finally {
    vi.useRealTimers();
  }
});

it("records a generated item storage failure and preserves the refund", async () => {
  const database = await emptyDatabase();
  const {account, cookie} = await signInPlayer();
  const ledgers = fakeLedgers();
  vi.mocked(runWeaponPipeline).mockResolvedValue(repairedWeapon);
  vi.spyOn(generatedItems, "keepGeneratedItem").mockRejectedValueOnce(new Error("synthetic item write failure"));

  expect((await makeWeapon(cookie)).status).toBe(502);
  expect(ledgers.accountOf(account.id).balance(Date.now())).toBe(DAILY_CREDITS);
  expect(await attemptResults(database)).toEqual([
    {outcome: "failed", prompt, failure_stage: "storage", failure_reason: "item-not-kept"},
  ]);
});

it("preserves the Make response and emits a closed event when the history write fails", async () => {
  const database = await emptyDatabase();
  const {account, cookie} = await signInPlayer();
  const ledgers = fakeLedgers();
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  vi.mocked(runWeaponPipeline).mockResolvedValue(repairedWeapon);
  vi.spyOn(history, "keepGenerationAttempt").mockRejectedValueOnce(new Error(prompt));

  expect((await makeWeapon(cookie)).status).toBe(200);
  expect(ledgers.accountOf(account.id).balance(Date.now())).toBe(DAILY_CREDITS - 1);
  expect(warn).toHaveBeenCalledExactlyOnceWith('{"route":"weapons","outcome":"generation-history-not-kept"}');
  expect(await attemptResults(database)).toEqual([]);
});

it("erases weapon history with the account and refuses a late write from its deleted session", async () => {
  const database = await emptyDatabase();
  const {account, cookie} = await signInPlayer();
  fakeLedgers();
  vi.mocked(runWeaponPipeline).mockResolvedValue(repairedWeapon);
  expect((await makeWeapon(cookie)).status).toBe(200);
  expect(await attemptResults(database)).toHaveLength(1);

  const keepGenerationAttempt = history.keepGenerationAttempt;
  vi.spyOn(history, "keepGenerationAttempt").mockImplementationOnce(async (...write) => {
    await removeAccount(account.id, {subjectDigest: async () => "test-digest", keepUntil: new Date()});
    await insertUser(database, account.id);

    return await keepGenerationAttempt(...write);
  });

  expect((await makeWeapon(cookie)).status).toBe(200);
  expect(await attemptResults(database)).toEqual([]);
});

it("writes no weapon history when capture is disabled", async () => {
  const database = await emptyDatabase();
  const {cookie} = await signInPlayer();
  fakeLedgers();
  Reflect.deleteProperty(workerEnvironment, "GENERATION_HISTORY_CAPTURE");
  vi.mocked(runWeaponPipeline).mockResolvedValue(repairedWeapon);

  expect((await makeWeapon(cookie)).status).toBe(200);
  expect(await attemptResults(database)).toEqual([]);
});

async function makeWeapon(cookie: string, text = prompt): Promise<Response> {
  return await generateWeaponRoute(
    new Request("https://gunsmith.test/api/weapons", {
      method: "POST",
      headers: {Cookie: cookie},
      body: JSON.stringify({prompt: text}),
    }),
  );
}

function attemptResults(database: D1Database): ReturnType<typeof rowsOf> {
  return rowsOf(database, "SELECT outcome, prompt, failure_stage, failure_reason FROM generation_attempts");
}
