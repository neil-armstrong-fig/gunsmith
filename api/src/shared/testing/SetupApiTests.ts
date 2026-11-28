import type {AccountRemoval} from "@src/shared/accounts/types/AccountRemoval";
import {testAccounts} from "@src/shared/accounts/testing/in-memory/TestAccounts";
import type {NewAccount} from "@src/shared/accounts/types/NewAccount";
import type {NewGeneratedItem} from "@src/shared/accounts/types/NewGeneratedItem";
import type {NewSession} from "@src/shared/accounts/types/NewSession";
import type {SaveItemRequest} from "@src/shared/accounts/types/SaveItemRequest";
import {workerEnvironment} from "@src/shared/env/WorkerEnvironment";
import {isArenaPipelineAvailable} from "@src/router/routes/arenas/pipeline/IsArenaPipelineAvailable";
import {isWeaponPipelineAvailable} from "@src/router/routes/weapons/pipeline/IsWeaponPipelineAvailable";
import {testGoogle} from "@src/router/routes/sign-in/google/testing/TestGoogle";
import type {GoogleAuthorization} from "@src/router/routes/sign-in/google/types/GoogleAuthorization";
import type {GoogleExchange} from "@src/router/routes/sign-in/google/types/GoogleExchange";

/**
 * Runs before every test file, so a route's test reaches the Worker's collaborators by the same imports the route uses and gets
 * stand-ins. **Mocked here** (the things outside the process): the account functions, which run on `testAccounts` (in memory, called through so a test can `vi.spyOn(testAccounts, ...)`;
 * `accounts/testing/RealAccounts.test.ts` holds them to real D1), the two Google functions, which run on `testGoogle`, and the two generation pipelines (automocked). The Worker's bindings are the `workerEnvironment` object: a test sets
 * what it needs on it (`workerEnvironment.CREDITS = ...`) and **every key is removed after each test**, so nothing leaks into the next.
 */
vi.mock("@src/shared/accounts/account-of-session/AccountOfSession", () => ({
  accountOfSession: (idHash: string, now: Date) => testAccounts.accountOfSession(idHash, now),
}));
vi.mock("@src/shared/accounts/create-session/CreateSession", () => ({
  createSession: (session: NewSession) => testAccounts.createSession(session),
}));
vi.mock("@src/shared/accounts/delete-session/DeleteSession", () => ({
  deleteSession: (idHash: string) => testAccounts.deleteSession(idHash),
}));
vi.mock("@src/shared/accounts/find-or-create-account/FindOrCreateAccount", () => ({
  findOrCreateAccount: (googleSub: string, newAccount: NewAccount) =>
    testAccounts.findOrCreateAccount(googleSub, newAccount),
}));
vi.mock("@src/shared/accounts/remove-account/RemoveAccount", () => ({
  removeAccount: (userId: string, removal: AccountRemoval) => testAccounts.removeAccount(userId, removal),
}));
vi.mock("@src/shared/accounts/claim-deleted-account-id/ClaimDeletedAccountId", () => ({
  claimDeletedAccountId: (subjectDigest: string, now: Date) => testAccounts.claimDeletedAccountId(subjectDigest, now),
}));
vi.mock("@src/shared/accounts/sweep-deleted-accounts/SweepDeletedAccounts", () => ({
  sweepDeletedAccounts: (now: Date) => testAccounts.sweepDeletedAccounts(now),
}));

vi.mock("@src/shared/accounts/keep-generated-item/KeepGeneratedItem", () => ({
  keepGeneratedItem: (item: NewGeneratedItem) => testAccounts.keepGeneratedItem(item),
}));
vi.mock("@src/shared/accounts/saved-items-of-account/SavedItemsOfAccount", () => ({
  savedItemsOfAccount: (userId: string) => testAccounts.savedItemsOfAccount(userId),
}));
vi.mock("@src/shared/accounts/save-item/SaveItem", () => ({
  saveItem: (request: SaveItemRequest) => testAccounts.saveItem(request),
}));
vi.mock("@src/shared/accounts/unsave-item/UnsaveItem", () => ({
  unsaveItem: (userId: string, id: string) => testAccounts.unsaveItem(userId, id),
}));
vi.mock("@src/shared/accounts/count-arena-play/CountArenaPlay", () => ({
  countArenaPlay: (arena: string, day: number) => testAccounts.countArenaPlay(arena, day),
}));
vi.mock("@src/shared/accounts/arena-plays-since/ArenaPlaysSince", () => ({
  arenaPlaysSince: (day: number) => testAccounts.arenaPlaysSince(day),
}));

vi.mock("@src/router/routes/sign-in/google/GoogleAuthorizationUrl", () => ({
  googleAuthorizationUrl: (authorization: GoogleAuthorization) => testGoogle.authorizationUrl(authorization),
}));
vi.mock("@src/router/routes/sign-in/google/GoogleSubjectOf", () => ({
  googleSubjectOf: (exchange: GoogleExchange) => testGoogle.subjectOf(exchange),
}));

// The two generation pipelines: there is no production adapter, so the real ones say no. A test says yes (the default here) and what
// the pipeline answers: `vi.mocked(runWeaponPipeline).mockResolvedValue(outcome)`.
vi.mock("@src/router/routes/weapons/pipeline/IsWeaponPipelineAvailable");
vi.mock("@src/router/routes/weapons/pipeline/RunWeaponPipeline");
vi.mock("@src/router/routes/arenas/pipeline/IsArenaPipelineAvailable");
vi.mock("@src/router/routes/arenas/pipeline/RunArenaPipeline");

beforeEach(() => {
  vi.mocked(isWeaponPipelineAvailable).mockReturnValue(true);
  vi.mocked(isArenaPipelineAvailable).mockReturnValue(true);
  testAccounts.reset();
  testGoogle.reset();
  // Google is set up unless a test deletes these (`isGoogleConfigured`); the stand-in never reads them.
  workerEnvironment.GOOGLE_OAUTH_CLIENT_ID = "test-client-id";
  workerEnvironment.GOOGLE_OAUTH_CLIENT_SECRET = "test-client-secret";
  // The sites that may speak for a player, and a limiter that lets everyone in (a test sets its own to say otherwise).
  workerEnvironment.ALLOWED_ORIGINS = "https://gunsmith.test,https://www.gunsmith.test";
  workerEnvironment.LOGIN_LIMITER = {limit: async () => ({success: true})};
});

afterEach(() => {
  for (const key of Object.keys(workerEnvironment)) {
    Reflect.deleteProperty(workerEnvironment, key);
  }
});
