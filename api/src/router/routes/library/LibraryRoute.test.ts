import {testAccounts} from "@src/shared/accounts/testing/in-memory/TestAccounts";
import {libraryRoute} from "@src/router/routes/library/LibraryRoute";
import {SHELF_LIMITS} from "@src/router/routes/library/limits/ShelfLimits";
import {keepAndSaveItem} from "@src/router/routes/library/testing/KeepAndSaveItem";
import {keepItem} from "@src/router/routes/library/testing/KeepItem";
import {cookieOfPlayer} from "@src/router/routes/shared/fake-accounts/CookieOfPlayer";

it("shows a signed-in player's shelf and its limits on GET /api/library", async () => {
  const cookie = cookieOfPlayer("acct-1");
  await keepAndSaveItem({
    accountId: "acct-1",
    id: "weapon-1",
    kind: "weapon",
    savedAt: new Date("2026-11-19T12:00:00Z"),
  });

  const response = await libraryRoute(request("GET", "/api/library", cookie));

  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({limits: SHELF_LIMITS, weapons: [{id: "weapon-1"}], arenas: []});
});

it("saves a kept item on POST /api/library", async () => {
  const cookie = cookieOfPlayer("acct-1");
  await keepItem("acct-1", "arena-1", "arena");

  const response = await libraryRoute(withBody(request("POST", "/api/library", cookie), '{"id":"arena-1"}'));

  expect(response.status).toBe(200);
  expect(await testAccounts.savedItemsOfAccount("acct-1")).toEqual([expect.objectContaining({id: "arena-1"})]);
});

it("takes an item off the shelf on DELETE /api/library/<id>", async () => {
  const cookie = cookieOfPlayer("acct-1");
  await keepAndSaveItem({accountId: "acct-1", id: "arena-1", kind: "arena", savedAt: new Date("2026-11-19T12:00:00Z")});

  const response = await libraryRoute(request("DELETE", "/api/library/arena-1", cookie));

  expect(response.status).toBe(200);
  expect(await testAccounts.savedItemsOfAccount("acct-1")).toEqual([]);
});

it("reads the id of an item from its path with the characters of a uuid", async () => {
  const cookie = cookieOfPlayer("acct-1");
  const id = crypto.randomUUID();
  await keepAndSaveItem({accountId: "acct-1", id, kind: "arena", savedAt: new Date("2026-11-19T12:00:00Z")});

  const response = await libraryRoute(request("DELETE", `/api/library/${id}`, cookie));

  expect(response.status).toBe(200);
});

it("answers 401 account-required to a guest and reads and writes nothing", async () => {
  const lookups = vi.spyOn(testAccounts, "savedItemsOfAccount");
  const saves = vi.spyOn(testAccounts, "saveItem");
  const removals = vi.spyOn(testAccounts, "unsaveItem");

  for (const guest of [
    request("GET", "/api/library"),
    withBody(request("POST", "/api/library"), '{"id":"arena-1"}'),
    request("DELETE", "/api/library/arena-1"),
  ]) {
    const response = await libraryRoute(guest);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({error: "account-required"});
  }
  expect(lookups).not.toHaveBeenCalled();
  expect(saves).not.toHaveBeenCalled();
  expect(removals).not.toHaveBeenCalled();
});

it("takes no account from an X-Account-Id header: naming one proves nobody", async () => {
  const response = await libraryRoute(
    new Request("https://gunsmith.test/api/library", {headers: {"X-Account-Id": "acct-1"}}),
  );

  expect(response.status).toBe(401);
});

it("answers 405 with what is allowed for a method the path does not take", async () => {
  const cookie = cookieOfPlayer("acct-1");

  const onShelf = await libraryRoute(request("PUT", "/api/library", cookie));
  const onItem = await libraryRoute(request("GET", "/api/library/arena-1", cookie));

  expect(onShelf.status).toBe(405);
  expect(onShelf.headers.get("Allow")).toBe("GET, POST");
  expect(onItem.status).toBe(405);
  expect(onItem.headers.get("Allow")).toBe("DELETE");
});

it("answers 404, not a crash, for an id with a broken escape", async () => {
  const cookie = cookieOfPlayer("acct-1");

  const response = await libraryRoute(request("DELETE", "/api/library/%E0%A4%A", cookie));

  expect(response.status).toBe(404);
  expect(await response.json()).toEqual({error: "not-found"});
});

it("answers 404 for a path past an item's id", async () => {
  const cookie = cookieOfPlayer("acct-1");

  const response = await libraryRoute(request("DELETE", "/api/library/arena-1/more", cookie));

  expect(response.status).toBe(404);
});

function request(method: string, path: string, cookie?: string): Request {
  return new Request(`https://gunsmith.test${path}`, {method, headers: headersOf(cookie)});
}

function withBody(request: Request, body: string): Request {
  return new Request(request, {body});
}

function headersOf(cookie: string | undefined): Record<string, string> {
  if (cookie === undefined) {
    return {};
  }

  return {Cookie: cookie};
}
