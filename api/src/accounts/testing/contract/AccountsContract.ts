import type {AccountFunctions} from "@src/accounts/types/AccountFunctions";
import type {ItemKind} from "@src/accounts/types/ItemKind";
import type {SaveItemResult} from "@src/accounts/types/SaveItemResult";

const NOW = new Date("2026-11-19T12:00:00Z");
const LATER = new Date("2026-11-20T12:00:00Z");

/**
 * What the account functions must do, run against the in-memory ones every route test uses and against real D1, so the two cannot
 * differ. Times are whole seconds (D1 keeps them so). `makeAccounts` gives each test functions over nothing.
 */
export function accountsContract(makeAccounts: () => Promise<AccountFunctions>): void {
  let accounts: AccountFunctions;

  beforeEach(async () => {
    accounts = await makeAccounts();
  });

  describe("accounts and sessions", () => {
    it("makes an account for a Google subject it has not seen", async () => {
      const account = await accounts.findOrCreateAccount("sub-1", {
        id: "acct-1",
        displayName: "Quiet Falcon",
        now: NOW,
      });

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
  });

  describe("the shelf", () => {
    const LIMITS = {weapons: 2, arenas: 1};

    beforeEach(async () => {
      await accounts.findOrCreateAccount("sub-1", {id: "acct-1", displayName: "Quiet Falcon", now: NOW});
      await accounts.findOrCreateAccount("sub-2", {id: "acct-2", displayName: "Loud Heron", now: NOW});
    });

    it("keeps a generated item off the shelf until it is saved", async () => {
      await keep("item-1", "acct-1", "weapon");

      expect(await accounts.savedItemsOfAccount("acct-1")).toEqual([]);
    });

    it("puts a kept item on the shelf as it was kept, saved when asked", async () => {
      await accounts.keepGeneratedItem({
        id: "item-1",
        userId: "acct-1",
        kind: "weapon",
        prompt: "a loud shotgun",
        payload: {weapon: {name: "Boomer"}, appearance: {shapes: [1, 2]}},
        now: NOW,
      });

      const result = await save("item-1", "acct-1", LATER);

      expect(result).toEqual({status: "saved"});
      expect(await accounts.savedItemsOfAccount("acct-1")).toEqual([
        {
          id: "item-1",
          kind: "weapon",
          prompt: "a loud shotgun",
          payload: {weapon: {name: "Boomer"}, appearance: {shapes: [1, 2]}},
          savedAt: LATER,
        },
      ]);
    });

    it("lists the shelf in the order the items were saved", async () => {
      await keep("item-a", "acct-1", "weapon");
      await keep("item-b", "acct-1", "arena");
      await save("item-b", "acct-1", NOW);
      await save("item-a", "acct-1", LATER);

      const shelf = await accounts.savedItemsOfAccount("acct-1");

      expect(shelf.map(item => item.id)).toEqual(["item-b", "item-a"]);
    });

    it("lists only the account's own saved items, however many others have saved", async () => {
      await keepAndSave(["item-1"], "acct-1", "weapon");
      await keepAndSave(["item-2", "item-3"], "acct-2", "weapon");

      expect((await accounts.savedItemsOfAccount("acct-1")).map(item => item.id)).toEqual(["item-1"]);
      expect((await accounts.savedItemsOfAccount("acct-2")).map(item => item.id)).toEqual(["item-2", "item-3"]);
    });

    it("saves an item that is already on the shelf without moving it or using another place", async () => {
      await keep("item-1", "acct-1", "arena");
      await save("item-1", "acct-1", NOW);

      const again = await save("item-1", "acct-1", LATER);

      expect(again).toEqual({status: "saved"});
      expect(await accounts.savedItemsOfAccount("acct-1")).toEqual([
        expect.objectContaining({id: "item-1", savedAt: NOW}),
      ]);
    });

    it("does not find an item that was never kept", async () => {
      expect(await save("item-nobody", "acct-1", NOW)).toEqual({status: "not-found"});
    });

    it("does not find another account's item, and leaves it where it was", async () => {
      await keep("item-1", "acct-2", "weapon");

      expect(await save("item-1", "acct-1", NOW)).toEqual({status: "not-found"});
      expect(await accounts.savedItemsOfAccount("acct-1")).toEqual([]);
      expect(await accounts.savedItemsOfAccount("acct-2")).toEqual([]);
    });

    it("refuses a save past the limit for its kind, and says which kind and what limit", async () => {
      await keepAndSave(["item-1", "item-2"], "acct-1", "weapon");
      await keep("item-3", "acct-1", "weapon");

      const result = await save("item-3", "acct-1", NOW);

      expect(result).toEqual({status: "full", kind: "weapon", limit: 2});
      expect((await accounts.savedItemsOfAccount("acct-1")).map(item => item.id)).toEqual(["item-1", "item-2"]);
    });

    it("counts weapons and arenas apart", async () => {
      await keepAndSave(["item-1", "item-2"], "acct-1", "weapon");
      await keep("item-3", "acct-1", "arena");
      await keep("item-4", "acct-1", "arena");

      expect(await save("item-3", "acct-1", NOW)).toEqual({status: "saved"});
      expect(await save("item-4", "acct-1", NOW)).toEqual({status: "full", kind: "arena", limit: 1});
    });

    it("counts one account's shelf apart from another's", async () => {
      await keepAndSave(["item-1", "item-2"], "acct-1", "weapon");
      await keep("item-3", "acct-2", "weapon");

      expect(await save("item-3", "acct-2", NOW)).toEqual({status: "saved"});
    });

    it("holds the limit when saves arrive together", async () => {
      await keep("item-1", "acct-1", "arena");
      await keep("item-2", "acct-1", "arena");
      await keep("item-3", "acct-1", "arena");

      const results = await Promise.all(["item-1", "item-2", "item-3"].map(async id => await save(id, "acct-1", NOW)));

      expect(results.filter(result => result.status === "saved")).toHaveLength(1);
      expect(await accounts.savedItemsOfAccount("acct-1")).toHaveLength(1);
    });

    it("takes an item off the shelf, frees its place and keeps it so it can be saved again", async () => {
      await keepAndSave(["item-1", "item-2"], "acct-1", "weapon");
      await keep("item-3", "acct-1", "weapon");

      const found = await accounts.unsaveItem("acct-1", "item-1");

      expect(found).toBe(true);
      expect((await accounts.savedItemsOfAccount("acct-1")).map(item => item.id)).toEqual(["item-2"]);
      expect(await save("item-3", "acct-1", NOW)).toEqual({status: "saved"});
      expect(await save("item-1", "acct-1", NOW)).toEqual({status: "full", kind: "weapon", limit: 2});
    });

    it("takes an item that is not on the shelf off it without complaint, but not one it does not have", async () => {
      await keep("item-1", "acct-1", "weapon");
      await keep("item-2", "acct-2", "weapon");

      expect(await accounts.unsaveItem("acct-1", "item-1")).toBe(true);
      expect(await accounts.unsaveItem("acct-1", "item-nobody")).toBe(false);
      expect(await accounts.unsaveItem("acct-1", "item-2")).toBe(false);
    });

    it("leaves another account's saved item on its shelf when asked to take it off", async () => {
      await keepAndSave(["item-1"], "acct-2", "weapon");

      await accounts.unsaveItem("acct-1", "item-1");

      expect(await accounts.savedItemsOfAccount("acct-2")).toHaveLength(1);
    });

    it("removes an account's items with it, so a later account with the same id does not inherit them", async () => {
      await keepAndSave(["item-1"], "acct-1", "weapon");

      await accounts.removeAccount("acct-1");
      await accounts.findOrCreateAccount("sub-3", {id: "acct-1", displayName: "Calm Otter", now: LATER});

      expect(await accounts.savedItemsOfAccount("acct-1")).toEqual([]);
      expect(await save("item-1", "acct-1", LATER)).toEqual({status: "not-found"});
    });

    async function keepAndSave(ids: string[], userId: string, kind: ItemKind): Promise<void> {
      for (const id of ids) {
        await keep(id, userId, kind);
        await save(id, userId, NOW);
      }
    }

    async function keep(id: string, userId: string, kind: ItemKind): Promise<void> {
      await accounts.keepGeneratedItem({id, userId, kind, prompt: `prompt of ${id}`, payload: {id}, now: NOW});
    }

    async function save(id: string, userId: string, now: Date): Promise<SaveItemResult> {
      return await accounts.saveItem({id, userId, now, limits: LIMITS});
    }
  });
}
