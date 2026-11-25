import {eraseExpiredGenerationAttempts} from "@src/account-retention/EraseExpiredGenerationAttempts";
import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import {generationAttemptsOfAccount} from "@src/accounts/generation-attempts-of-account/GenerationAttemptsOfAccount";
import {removeAccount} from "@src/accounts/remove-account/RemoveAccount";
import {insertUser} from "@src/accounts/testing/local-database/InsertUser";
import {generationHistoryPrivacyCheck} from "@src/router/routes/shared/generation-history/privacy/GenerationHistoryPrivacyCheck";
import {rowsOf} from "@src/accounts/testing/local-database/RowsOf";
import {useLocalDatabase} from "@src/accounts/testing/local-database/UseLocalDatabase";
import {DAILY_CREDITS} from "@src/durable-objects/credit-ledger/account/DailyCredits";
import {ARENA_SPEND} from "@src/durable-objects/spend-ledger/estimate/arena/ArenaSpend";
import {SPEND_CAPS} from "@src/durable-objects/spend-ledger/meter/SpendCaps";
import {generateArenaRoute} from "@src/router/routes/arenas/GenerateArenaRoute";
import {isArenaPipelineAvailable} from "@src/router/routes/arenas/pipeline/IsArenaPipelineAvailable";
import {runArenaPipeline} from "@src/router/routes/arenas/pipeline/RunArenaPipeline";
import {signInPlayer} from "@src/router/routes/shared/fake-accounts/SignInPlayer";
import {fakeLedgers} from "@src/router/routes/shared/fake-ledgers/FakeLedgers";
import {PIPELINE_TIME_LIMIT_MILLISECONDS} from "@src/router/routes/shared/time-limit/PipelineTimeLimit";

vi.unmock("@src/accounts/account-of-session/AccountOfSession");
vi.unmock("@src/accounts/create-session/CreateSession");
vi.unmock("@src/accounts/find-or-create-account/FindOrCreateAccount");
vi.unmock("@src/accounts/keep-generated-item/KeepGeneratedItem");
vi.unmock("@src/accounts/remove-account/RemoveAccount");

vi.mock("@src/router/routes/shared/generation-history/privacy/GenerationHistoryPrivacyCheck");

beforeEach(() => {
  vi.mocked(generationHistoryPrivacyCheck).mockReturnValue(async () => true);
});

const emptyDatabase = useLocalDatabase();
const prompt = "  An arena with one raised platform.\n";
const repairedArena = {
  status: "created" as const,
  arena: {name: "Raised yard"},
  refunded: false,
  nodes: ["precheck", "moderation", "generate", "validate", "repair", "validate"],
  modelCalls: 3,
  history: {pipelineVersion: "arena-v1", relevance: "accepted" as const, codeEdits: 2, modelRepairs: 1},
};

it("records an AI-off refusal without judging the prompt or reserving a credit", async () => {
  const database = await emptyDatabase();
  const {account, cookie} = await signInPlayer();
  const ledgers = fakeLedgers({aiOn: false, returnsAt: 1_800_000_000_000});
  const privacyCheck = vi.fn();
  vi.mocked(generationHistoryPrivacyCheck).mockReturnValue(privacyCheck);

  const response = await makeArena(prompt, cookie);

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-off", returnsAt: 1_800_000_000_000});
  expect(ledgers.calls).toEqual(["status"]);
  expect(runArenaPipeline).not.toHaveBeenCalled();
  expect(privacyCheck).not.toHaveBeenCalled();
  expect(await attemptFailures(database)).toEqual([
    {outcome: "blocked", prompt: null, failure_stage: "spend", failure_reason: "ai-off"},
  ]);
  expect(await generationAttemptsOfAccount(account.id, new Date())).toEqual([
    expect.objectContaining({
      id: expect.any(String),
      userId: account.id,
      kind: "arena",
      createdAt: expect.any(Date),
      pipelineVersion: "arena-v1",
      codeEdits: 0,
      modelRepairs: 0,
    }),
  ]);
});

it("records a valid signed-in request when the pipeline is unavailable", async () => {
  const database = await emptyDatabase();
  const {cookie} = await signInPlayer();
  const ledgers = fakeLedgers();
  vi.mocked(isArenaPipelineAvailable).mockReturnValue(false);

  const response = await makeArena(prompt, cookie);

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-unavailable"});
  expect(ledgers.calls).toEqual([]);
  expect(runArenaPipeline).not.toHaveBeenCalled();
  expect(await attemptFailures(database)).toEqual([
    {outcome: "blocked", prompt: null, failure_stage: "availability", failure_reason: "ai-unavailable"},
  ]);
});

it("records the credit refusal before reserving spend", async () => {
  const database = await emptyDatabase();
  const {account, cookie} = await signInPlayer();
  const ledgers = fakeLedgers();
  const credits = ledgers.accountOf(account.id);
  for (let index = 0; index < DAILY_CREDITS; index += 1) {
    credits.reserve(`earlier-${index}`, "arena", Date.now());
  }

  const response = await makeArena(prompt, cookie);

  expect(response.status).toBe(402);
  expect(await response.json()).toEqual({error: "no-credits"});
  expect(ledgers.calls).toEqual(["status", "reserve:arena"]);
  expect(runArenaPipeline).not.toHaveBeenCalled();
  expect(await attemptFailures(database)).toEqual([
    {outcome: "blocked", prompt: null, failure_stage: "credit", failure_reason: "no-credits"},
  ]);
});

it("records a spend-cap refusal and refunds the reserved credit", async () => {
  const database = await emptyDatabase();
  const {account, cookie} = await signInPlayer();
  const ledgers = fakeLedgers();
  ledgers.spendMeter.reserve(
    "earlier",
    SPEND_CAPS.dailyMicrodollars - ARENA_SPEND.reservedMicrodollars + 1,
    Date.now(),
  );

  const response = await makeArena(prompt, cookie);

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-off", returnsAt: expect.any(Number)});
  expect(ledgers.calls).toEqual(["status", "reserve:arena", "spend:reserve", "refund", "status"]);
  expect(ledgers.accountOf(account.id).balance(Date.now())).toBe(DAILY_CREDITS);
  expect(runArenaPipeline).not.toHaveBeenCalled();
  expect(await attemptFailures(database)).toEqual([
    {outcome: "blocked", prompt: null, failure_stage: "spend", failure_reason: "spend-cap"},
  ]);
});

it("records a pipeline exception as a closed reason and refunds the reserved credit", async () => {
  const database = await emptyDatabase();
  const {account, cookie} = await signInPlayer();
  const ledgers = fakeLedgers();
  vi.mocked(runArenaPipeline).mockRejectedValue(new Error(prompt));

  const response = await makeArena(prompt, cookie);

  expect(response.status).toBe(502);
  expect(await response.json()).toEqual({error: "generation-failed"});
  expect(ledgers.calls).toEqual(["status", "reserve:arena", "spend:reserve", "spend:settle", "refund"]);
  expect(ledgers.accountOf(account.id).balance(Date.now())).toBe(DAILY_CREDITS);
  expect(ledgers.spendMeter.spentThisMonth()).toBe(ARENA_SPEND.reservedMicrodollars);
  expect(await attemptFailures(database)).toEqual([
    {outcome: "failed", prompt: null, failure_stage: "pipeline", failure_reason: "generation-failed"},
  ]);
});

it("records a timeout once even if the pipeline later returns a successful arena", async () => {
  const database = await emptyDatabase();
  const {cookie} = await signInPlayer();
  const ledgers = fakeLedgers();
  let markStarted: (signal: AbortSignal) => void = () => undefined;
  const started = new Promise<AbortSignal>(resolve => {
    markStarted = resolve;
  });
  let finish: (outcome: ArenaOutcome) => void = () => undefined;
  const lateOutcome = new Promise<ArenaOutcome>(resolve => {
    finish = resolve;
  });
  vi.mocked(runArenaPipeline).mockImplementation((_prompt, signal) => {
    markStarted(signal);

    return lateOutcome;
  });
  vi.useFakeTimers({toFake: ["setTimeout", "clearTimeout"]});
  try {
    const pending = makeArena(prompt, cookie);
    const signal = await started;
    await vi.advanceTimersByTimeAsync(PIPELINE_TIME_LIMIT_MILLISECONDS);
    const response = await pending;
    expect(response.status).toBe(504);
    expect(await response.json()).toEqual({error: "generation-timed-out"});
    expect(signal.aborted).toBe(true);
    expect(ledgers.spendMeter.spentThisMonth()).toBe(ARENA_SPEND.reservedMicrodollars);
    expect(await attemptFailures(database)).toEqual([
      {outcome: "failed", prompt: null, failure_stage: "pipeline", failure_reason: "generation-timed-out"},
    ]);

    finish(repairedArena);
    await vi.advanceTimersByTimeAsync(0);
    expect(ledgers.calls).toEqual(["status", "reserve:arena", "spend:reserve", "spend:settle", "refund"]);
    expect(await attemptFailures(database)).toHaveLength(1);
  } finally {
    vi.useRealTimers();
  }
});

it("records the original privacy-cleared prompt once when making an arena succeeds after repair", async () => {
  const database = await emptyDatabase();
  vi.mocked(runArenaPipeline).mockResolvedValue(repairedArena);

  const response = await makeArena(prompt);

  expect(await response.json()).toEqual({id: expect.any(String), status: "created", arena: {name: "Raised yard"}});
  expect(
    await rowsOf(
      database,
      "SELECT kind, outcome, prompt, pipeline_version, code_edits, model_repairs FROM generation_attempts",
    ),
  ).toEqual([
    {kind: "arena", outcome: "repaired-success", prompt, pipeline_version: "arena-v1", code_edits: 2, model_repairs: 1},
  ]);
});

it("records an irrelevant arena request once without storing its prompt or the judge's free text", async () => {
  const database = await emptyDatabase();
  const rejectedArena = {
    status: "rejected" as const,
    reason: "Not an arena request",
    refunded: false,
    nodes: ["precheck", "moderation"],
    modelCalls: 1,
    history: {pipelineVersion: "arena-v1", relevance: "irrelevant" as const, codeEdits: 0, modelRepairs: 0},
  };
  vi.mocked(runArenaPipeline).mockResolvedValue(rejectedArena);

  const response = await makeArena("A recipe for soup");

  expect(await response.json()).toEqual({status: "rejected", reason: "Not an arena request"});
  expect(
    await rowsOf(database, "SELECT outcome, prompt, failure_stage, failure_reason FROM generation_attempts"),
  ).toEqual([{outcome: "rejected", prompt: null, failure_stage: "moderation", failure_reason: "irrelevant"}]);
});

it("omits text when the privacy check denies it or cannot complete", async () => {
  const database = await emptyDatabase();
  vi.mocked(runArenaPipeline).mockResolvedValue(repairedArena);
  const privacyCheck = vi
    .fn<(text: string) => Promise<boolean>>()
    .mockResolvedValueOnce(false)
    .mockRejectedValueOnce(new Error("synthetic failure"));
  vi.mocked(generationHistoryPrivacyCheck).mockReturnValue(privacyCheck);

  expect((await makeArena(prompt)).status).toBe(200);
  expect((await makeArena(prompt)).status).toBe(200);
  expect(privacyCheck).toHaveBeenCalledTimes(2);
  expect(await rowsOf(database, "SELECT outcome, prompt FROM generation_attempts")).toEqual([
    {outcome: "repaired-success", prompt: null},
    {outcome: "repaired-success", prompt: null},
  ]);
});

it("classifies an invalid request as a failed generation and preserves its half-credit charge", async () => {
  await emptyDatabase();
  const {account, cookie} = await signInPlayer();
  vi.mocked(runArenaPipeline).mockResolvedValue({
    ...repairedArena,
    arena: undefined,
    status: "invalid",
    reason: "We could not build that arena.",
    history: {...repairedArena.history, validationFailure: "ragged-rows"},
  });
  const ledgers = fakeLedgers();

  const response = await makeArena(prompt, cookie);

  expect(await response.json()).toEqual({status: "invalid", reason: "We could not build that arena."});
  expect(ledgers.calls).toContain("settle:unusable");
  expect(await generationAttemptsOfAccount(account.id, new Date())).toEqual([
    expect.objectContaining({outcome: "failed", failureStage: "validation", failureReason: "ragged-rows"}),
  ]);
});

it("records a first-pass creation and hides it at exactly 14 days before physical cleanup", async () => {
  const database = await emptyDatabase();
  const {account, cookie} = await signInPlayer();
  vi.mocked(runArenaPipeline).mockResolvedValue({
    ...repairedArena,
    history: {...repairedArena.history, codeEdits: 0, modelRepairs: 0},
  });
  fakeLedgers();
  await makeArena(prompt, cookie);
  const [attempt] = await generationAttemptsOfAccount(account.id, new Date());
  if (attempt === undefined) throw new Error("Missing attempt");

  const expiry = new Date(attempt.createdAt.getTime() + 14 * 86_400_000);
  const beforeExpiry = new Date(expiry.getTime() - 1000);
  expect(attempt.outcome).toBe("first-pass-success");
  expect(await generationAttemptsOfAccount(account.id, beforeExpiry)).toEqual([attempt]);
  expect(await generationAttemptsOfAccount(account.id, expiry)).toEqual([]);
  await eraseExpiredGenerationAttempts(beforeExpiry);
  expect(await rowsOf(database, "SELECT id FROM generation_attempts")).toEqual([{id: attempt.id}]);
  await eraseExpiredGenerationAttempts(expiry);
  expect(await rowsOf(database, "SELECT id FROM generation_attempts")).toEqual([]);
});

it("deletes account history and prevents an in-flight attempt recreating it after the account ID is reused", async () => {
  const database = await emptyDatabase();
  const {account, cookie} = await signInPlayer();
  const otherPlayer = await signInPlayer();
  vi.mocked(runArenaPipeline).mockResolvedValue(repairedArena);
  fakeLedgers();
  await makeArena(prompt, cookie);
  await makeArena(prompt, otherPlayer.cookie);
  expect(await generationAttemptsOfAccount(account.id, new Date())).toHaveLength(1);
  vi.mocked(generationHistoryPrivacyCheck).mockReturnValue(async () => {
    await removeAccount(account.id, {subjectDigest: async () => "test-digest", keepUntil: new Date()});
    await insertUser(database, account.id);

    return true;
  });

  expect((await makeArena(prompt, cookie)).status).toBe(200);
  expect(await rowsOf(database, "SELECT user_id FROM generation_attempts")).toEqual([
    {user_id: otherPlayer.account.id},
  ]);
});

it("captures zero history rows when the default gate is closed", async () => {
  const database = await emptyDatabase();
  const actual = await vi.importActual<Record<"generationHistoryPrivacyCheck", typeof generationHistoryPrivacyCheck>>(
    "@src/router/routes/shared/generation-history/privacy/GenerationHistoryPrivacyCheck",
  );
  vi.mocked(generationHistoryPrivacyCheck).mockImplementation(actual.generationHistoryPrivacyCheck);
  vi.mocked(runArenaPipeline).mockResolvedValue(repairedArena);

  expect((await makeArena(prompt)).status).toBe(200);
  vi.mocked(runArenaPipeline).mockRejectedValue(new Error("synthetic failure"));
  expect((await makeArena(prompt)).status).toBe(502);
  vi.mocked(isArenaPipelineAvailable).mockReturnValue(false);
  expect((await makeArena(prompt)).status).toBe(503);
  expect(await rowsOf(database, "SELECT id FROM generation_attempts")).toEqual([]);
});

it.each([true, false])("omits invalid requests from history with pipeline availability %s", async available => {
  const database = await emptyDatabase();
  const {cookie} = await signInPlayer();
  const ledgers = fakeLedgers();
  vi.mocked(isArenaPipelineAvailable).mockReturnValue(available);
  const url = "https://gunsmith.test/api/arenas";

  const anonymous = await generateArenaRoute(new Request(url, {method: "POST", body: JSON.stringify({prompt})}));
  const malformed = await generateArenaRoute(new Request(url, {method: "POST", headers: {Cookie: cookie}, body: "{"}));
  const wrongMethod = await generateArenaRoute(new Request(url, {headers: {Cookie: cookie}}));

  if (available) {
    expect(anonymous.status).toBe(401);
    expect(malformed.status).toBe(400);
  } else {
    expect(anonymous.status).toBe(503);
    expect(malformed.status).toBe(503);
  }
  expect(wrongMethod.status).toBe(405);
  expect(wrongMethod.headers.get("Allow")).toBe("POST");
  expect(ledgers.calls).toEqual([]);
  expect(runArenaPipeline).not.toHaveBeenCalled();
  expect(await attemptFailures(database)).toEqual([]);
});

async function makeArena(text: string, cookie?: string): Promise<Response> {
  if (cookie === undefined) {
    fakeLedgers();
    cookie = (await signInPlayer()).cookie;
  }

  return await generateArenaRoute(
    new Request("https://gunsmith.test/api/arenas", {
      method: "POST",
      headers: {Cookie: cookie},
      body: JSON.stringify({prompt: text}),
    }),
  );
}

function attemptFailures(database: D1Database): ReturnType<typeof rowsOf> {
  return rowsOf(database, "SELECT outcome, prompt, failure_stage, failure_reason FROM generation_attempts");
}
