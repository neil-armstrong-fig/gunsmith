import type {ArenaPlays} from "@gunsmith/engine/arena-rotation/types/ArenaPlays";
import type {AccountRemoval} from "@src/accounts/types/AccountRemoval";
import type {AccountFunctions} from "@src/accounts/types/AccountFunctions";
import type {ItemKind} from "@src/accounts/types/ItemKind";
import type {SaveItemResult} from "@src/accounts/types/SaveItemResult";

const NOW = new Date("2026-11-19T12:00:00Z");
const LATER = new Date("2026-11-20T12:00:00Z");
const MUCH_LATER = new Date("2027-02-17T12:00:00Z");
const REMOVAL: AccountRemoval = {subjectDigest: async googleSub => `digest-of-${googleSub}`, keepUntil: MUCH_LATER};

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

      await accounts.removeAccount("acct-1", REMOVAL);

      expect(await accounts.accountOfSession("hash-1", NOW)).toBeUndefined();
      expect(await accounts.accountOfSession("hash-2", NOW)).toEqual({id: "acct-2", displayName: "Loud Heron"});
    });

    it("makes a new account for a subject whose account was removed", async () => {
      await accounts.findOrCreateAccount("sub-1", {id: "acct-1", displayName: "Quiet Falcon", now: NOW});
      await accounts.removeAccount("acct-1", REMOVAL);

      const again = await accounts.findOrCreateAccount("sub-1", {id: "acct-9", displayName: "Loud Heron", now: LATER});

      expect(again).toEqual({id: "acct-9", displayName: "Loud Heron"});
    });

    it("removes an account that is not there without complaint", async () => {
      await expect(accounts.removeAccount("acct-nobody", REMOVAL)).resolves.toBeUndefined();
    });
  });

  describe("a deleted account's credits", () => {
    beforeEach(async () => {
      await accounts.findOrCreateAccount("sub-1", {id: "acct-1", displayName: "Quiet Falcon", now: NOW});
      await accounts.findOrCreateAccount("sub-2", {id: "acct-2", displayName: "Loud Heron", now: NOW});
    });

    it("hands the removed account's credit id back to the same person's digest while it is kept", async () => {
      await accounts.removeAccount("acct-1", REMOVAL);

      expect(await accounts.claimDeletedAccountId("digest-of-sub-1", LATER)).toBe("acct-1");
    });

    it("hands it back once: the claim uses the record up", async () => {
      await accounts.removeAccount("acct-1", REMOVAL);
      await accounts.claimDeletedAccountId("digest-of-sub-1", LATER);

      expect(await accounts.claimDeletedAccountId("digest-of-sub-1", LATER)).toBeUndefined();
    });

    it("hands it to only one of two claims that arrive together", async () => {
      await accounts.removeAccount("acct-1", REMOVAL);

      const claims = await Promise.all([
        accounts.claimDeletedAccountId("digest-of-sub-1", LATER),
        accounts.claimDeletedAccountId("digest-of-sub-1", LATER),
      ]);

      expect(claims.filter(claim => claim === "acct-1")).toHaveLength(1);
    });

    it("hands nothing back once the time to keep it has come", async () => {
      await accounts.removeAccount("acct-1", REMOVAL);

      expect(await accounts.claimDeletedAccountId("digest-of-sub-1", new Date(MUCH_LATER.getTime() - 1000))).toBe(
        "acct-1",
      );
      await accounts.removeAccount("acct-2", REMOVAL);
      expect(await accounts.claimDeletedAccountId("digest-of-sub-2", MUCH_LATER)).toBeUndefined();
    });

    it("hands nothing back to a digest it does not hold", async () => {
      await accounts.removeAccount("acct-1", REMOVAL);

      expect(await accounts.claimDeletedAccountId("digest-of-sub-9", LATER)).toBeUndefined();
    });

    it("keeps nothing for an account that was not there", async () => {
      await accounts.removeAccount("acct-nobody", REMOVAL);

      expect(await accounts.sweepDeletedAccounts(new Date("2100-01-01T00:00:00Z"))).toEqual([]);
    });

    it("keeps only the record of the account removed", async () => {
      await accounts.removeAccount("acct-1", REMOVAL);

      expect(await accounts.claimDeletedAccountId("digest-of-sub-2", LATER)).toBeUndefined();
    });

    it("replaces a record still held for the same person when the account is made and removed again", async () => {
      await accounts.removeAccount("acct-1", REMOVAL);
      await accounts.findOrCreateAccount("sub-1", {id: "acct-7", displayName: "Quiet Falcon", now: LATER});
      await accounts.removeAccount("acct-7", REMOVAL);

      expect(await accounts.claimDeletedAccountId("digest-of-sub-1", LATER)).toBe("acct-7");
    });

    it("sweeps what has expired, answering the credit ids to erase, and leaves what is still kept", async () => {
      await accounts.removeAccount("acct-1", {...REMOVAL, keepUntil: LATER});
      await accounts.removeAccount("acct-2", REMOVAL);

      expect(await accounts.sweepDeletedAccounts(LATER)).toEqual(["acct-1"]);
      expect(await accounts.sweepDeletedAccounts(LATER)).toEqual([]);
      expect(await accounts.claimDeletedAccountId("digest-of-sub-2", LATER)).toBe("acct-2");
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

      await accounts.removeAccount("acct-1", REMOVAL);
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

  describe("the plays of each arena", () => {
    it("counts every match begun on an arena on a day", async () => {
      await accounts.countArenaPlay("Keep", 20_000);
      await accounts.countArenaPlay("Keep", 20_000);

      expect(await accounts.arenaPlaysSince(20_000)).toEqual([{arena: "Keep", day: 20_000, count: 2}]);
    });

    it("keeps another arena's plays and another day's apart", async () => {
      await accounts.countArenaPlay("Keep", 20_000);
      await accounts.countArenaPlay("Slalom", 20_000);
      await accounts.countArenaPlay("Keep", 20_001);

      expect(sortedByDayAndArena(await accounts.arenaPlaysSince(20_000))).toEqual([
        {arena: "Keep", day: 20_000, count: 1},
        {arena: "Slalom", day: 20_000, count: 1},
        {arena: "Keep", day: 20_001, count: 1},
      ]);
    });

    it("reads the plays from the day asked for on, and none before it", async () => {
      await accounts.countArenaPlay("Keep", 19_999);
      await accounts.countArenaPlay("Slalom", 20_000);

      expect(await accounts.arenaPlaysSince(20_000)).toEqual([{arena: "Slalom", day: 20_000, count: 1}]);
    });

    it("reads nothing when nothing has been played", async () => {
      expect(await accounts.arenaPlaysSince(0)).toEqual([]);
    });

    function sortedByDayAndArena(plays: readonly ArenaPlays[]): ArenaPlays[] {
      return [...plays].sort((first, second) => first.day - second.day || first.arena.localeCompare(second.arena));
    }
  });
}
