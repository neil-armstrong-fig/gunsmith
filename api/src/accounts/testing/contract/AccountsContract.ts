import type {AccountFunctions} from "@src/accounts/types/AccountFunctions";

const NOW = new Date("2026-11-19T12:00:00Z");
const LATER = new Date("2026-11-20T12:00:00Z");

/**
 * What the five account functions must do, run against the in-memory ones every route test uses and against real D1, so the two cannot
 * differ. Times are whole seconds (D1 keeps them so). `makeAccounts` gives each test functions over nothing.
 */
export function accountsContract(makeAccounts: () => Promise<AccountFunctions>): void {
  let accounts: AccountFunctions;

  beforeEach(async () => {
    accounts = await makeAccounts();
  });

  it("makes an account for a Google subject it has not seen", async () => {
    const account = await accounts.findOrCreateAccount("sub-1", {id: "acct-1", displayName: "Quiet Falcon", now: NOW});

    expect(account).toEqual({id: "acct-1", displayName: "Quiet Falcon"});
  });

  it("gives the same account back for the same subject, keeping the first id and name", async () => {
    await accounts.findOrCreateAccount("sub-1", {id: "acct-1", displayName: "Quiet Falcon", now: NOW});

    const again = await accounts.findOrCreateAccount("sub-1", {id: "acct-2", displayName: "Loud Heron", now: LATER});

    expect(again).toEqual({id: "acct-1", displayName: "Quiet Falcon"});
  });

  it("gives two subjects two accounts", async () => {
    const first = await accounts.findOrCreateAccount("sub-1", {id: "acct-1", displayName: "Quiet Falcon", now: NOW});
    const second = await accounts.findOrCreateAccount("sub-2", {id: "acct-2", displayName: "Loud Heron", now: NOW});

    expect(first.id).toBe("acct-1");
    expect(second.id).toBe("acct-2");
  });

  it("makes one account when the same subject first signs in twice at once", async () => {
    const [first, second] = await Promise.all([
      accounts.findOrCreateAccount("sub-1", {id: "acct-1", displayName: "Quiet Falcon", now: NOW}),
      accounts.findOrCreateAccount("sub-1", {id: "acct-2", displayName: "Loud Heron", now: NOW}),
    ]);

    expect(second).toEqual(first);
  });

  it("knows whose a live session is", async () => {
    await accounts.findOrCreateAccount("sub-1", {id: "acct-1", displayName: "Quiet Falcon", now: NOW});
    await accounts.createSession({idHash: "hash-1", userId: "acct-1", expiresAt: LATER});

    const account = await accounts.accountOfSession("hash-1", NOW);

    expect(account).toEqual({id: "acct-1", displayName: "Quiet Falcon"});
  });

  it("knows no one for a session it does not have", async () => {
    await accounts.findOrCreateAccount("sub-1", {id: "acct-1", displayName: "Quiet Falcon", now: NOW});
    await accounts.createSession({idHash: "hash-1", userId: "acct-1", expiresAt: LATER});

    expect(await accounts.accountOfSession("hash-2", NOW)).toBeUndefined();
  });

  it("knows no one for a session at the second it expires, or after", async () => {
    await accounts.findOrCreateAccount("sub-1", {id: "acct-1", displayName: "Quiet Falcon", now: NOW});
    await accounts.createSession({idHash: "hash-1", userId: "acct-1", expiresAt: LATER});

    expect(await accounts.accountOfSession("hash-1", LATER)).toBeUndefined();
    expect(await accounts.accountOfSession("hash-1", new Date(LATER.getTime() + 1000))).toBeUndefined();
  });

  it("ends a session when it is deleted, and only that one", async () => {
    await accounts.findOrCreateAccount("sub-1", {id: "acct-1", displayName: "Quiet Falcon", now: NOW});
    await accounts.createSession({idHash: "hash-1", userId: "acct-1", expiresAt: LATER});
    await accounts.createSession({idHash: "hash-2", userId: "acct-1", expiresAt: LATER});

    await accounts.deleteSession("hash-1");

    expect(await accounts.accountOfSession("hash-1", NOW)).toBeUndefined();
    expect(await accounts.accountOfSession("hash-2", NOW)).toEqual({id: "acct-1", displayName: "Quiet Falcon"});
  });

  it("deletes a session it never had without complaint", async () => {
    await expect(accounts.deleteSession("hash-nobody")).resolves.toBeUndefined();
  });

  it("removes an account and its sessions, leaving another account's alone", async () => {
    await accounts.findOrCreateAccount("sub-1", {id: "acct-1", displayName: "Quiet Falcon", now: NOW});
    await accounts.findOrCreateAccount("sub-2", {id: "acct-2", displayName: "Loud Heron", now: NOW});
    await accounts.createSession({idHash: "hash-1", userId: "acct-1", expiresAt: LATER});
    await accounts.createSession({idHash: "hash-2", userId: "acct-2", expiresAt: LATER});

    await accounts.removeAccount("acct-1");

    expect(await accounts.accountOfSession("hash-1", NOW)).toBeUndefined();
    expect(await accounts.accountOfSession("hash-2", NOW)).toEqual({id: "acct-2", displayName: "Loud Heron"});
  });

  it("makes a new account for a subject whose account was removed", async () => {
    await accounts.findOrCreateAccount("sub-1", {id: "acct-1", displayName: "Quiet Falcon", now: NOW});
    await accounts.removeAccount("acct-1");

    const again = await accounts.findOrCreateAccount("sub-1", {id: "acct-9", displayName: "Loud Heron", now: LATER});

    expect(again).toEqual({id: "acct-9", displayName: "Loud Heron"});
  });

  it("removes an account that is not there without complaint", async () => {
    await expect(accounts.removeAccount("acct-nobody")).resolves.toBeUndefined();
  });
}
