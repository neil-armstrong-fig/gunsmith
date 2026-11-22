import {eraseExpiredGenerationAttempts} from "@src/account-retention/EraseExpiredGenerationAttempts";
import {generationAttemptsOfAccount} from "@src/accounts/generation-attempts-of-account/GenerationAttemptsOfAccount";
import {removeAccount} from "@src/accounts/remove-account/RemoveAccount";
import {insertUser} from "@src/accounts/testing/local-database/InsertUser";
import {arenaHistoryPrivacyCheck} from "@src/router/routes/arenas/history/privacy/ArenaHistoryPrivacyCheck";
import {rowsOf} from "@src/accounts/testing/local-database/RowsOf";
import {useLocalDatabase} from "@src/accounts/testing/local-database/UseLocalDatabase";
import {generateArenaRoute} from "@src/router/routes/arenas/GenerateArenaRoute";
import {runArenaPipeline} from "@src/router/routes/arenas/pipeline/RunArenaPipeline";
import {signInPlayer} from "@src/router/routes/shared/fake-accounts/SignInPlayer";
import {fakeLedgers} from "@src/router/routes/shared/fake-ledgers/FakeLedgers";

vi.unmock("@src/accounts/account-of-session/AccountOfSession");
vi.unmock("@src/accounts/create-session/CreateSession");
vi.unmock("@src/accounts/find-or-create-account/FindOrCreateAccount");
vi.unmock("@src/accounts/keep-generated-item/KeepGeneratedItem");
vi.unmock("@src/accounts/remove-account/RemoveAccount");

vi.mock("@src/router/routes/arenas/history/privacy/ArenaHistoryPrivacyCheck");

beforeEach(() => {
  vi.mocked(arenaHistoryPrivacyCheck).mockReturnValue(async () => true);
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
  vi.mocked(arenaHistoryPrivacyCheck).mockReturnValue(privacyCheck);

  expect((await makeArena(prompt)).status).toBe(200);
  expect((await makeArena(prompt)).status).toBe(200);
  expect(privacyCheck).toHaveBeenCalledTimes(2);
  expect(await rowsOf(database, "SELECT outcome, prompt FROM generation_attempts")).toEqual([
    {outcome: "repaired-success", prompt: null},
    {outcome: "repaired-success", prompt: null},
  ]);
});

it("classifies a built-in substitute as a failed generation and preserves its half-credit charge", async () => {
  await emptyDatabase();
  const {account, cookie} = await signInPlayer();
  vi.mocked(runArenaPipeline).mockResolvedValue({
    ...repairedArena,
    status: "builtIn",
    reason: "We could not build that arena.",
    history: {...repairedArena.history, validationFailure: "ragged-rows"},
  });
  const ledgers = fakeLedgers();

  const response = await makeArena(prompt, cookie);

  expect(await response.json()).toEqual({
    status: "builtIn",
    arena: {name: "Raised yard"},
    reason: "We could not build that arena.",
  });
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
  vi.mocked(arenaHistoryPrivacyCheck).mockReturnValue(async () => {
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
  const actual = await vi.importActual<Record<"arenaHistoryPrivacyCheck", typeof arenaHistoryPrivacyCheck>>(
    "@src/router/routes/arenas/history/privacy/ArenaHistoryPrivacyCheck",
  );
  vi.mocked(arenaHistoryPrivacyCheck).mockImplementation(actual.arenaHistoryPrivacyCheck);
  vi.mocked(runArenaPipeline).mockResolvedValue(repairedArena);

  expect((await makeArena(prompt)).status).toBe(200);
  expect(await rowsOf(database, "SELECT id FROM generation_attempts")).toEqual([]);
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
