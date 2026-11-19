import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import type {ApiEnvironment} from "@src/env/types/ApiEnvironment";
import {handleApiRequest} from "@src/router/HandleApiRequest";
import {isFriendCode} from "@src/rooms/IsFriendCode";

it("opens a private room and answers its friend code", async () => {
  const response = await handleApiRequest(
    new Request("https://gunsmith.test/api/rooms", {method: "POST"}),
    environment(),
  );
  const body = (await response.json()) as {code: string};

  expect(response.status).toBe(201);
  expect(isFriendCode(body.code)).toBe(true);
});

it("answers a different code to each room", async () => {
  const open = async (): Promise<string> => {
    const response = await handleApiRequest(
      new Request("https://gunsmith.test/api/rooms", {method: "POST"}),
      environment(),
    );

    return ((await response.json()) as {code: string}).code;
  };

  expect(await open()).not.toBe(await open());
});

it("refuses any way of asking for a room but POST", async () => {
  const response = await handleApiRequest(new Request("https://gunsmith.test/api/rooms"), environment());

  expect(response.status).toBe(405);
  expect(response.headers.get("Allow")).toBe("POST");
});

it("hands a WebSocket upgrade to the match of that code", async () => {
  const names: string[] = [];
  const response = await handleApiRequest(upgrade("/api/rooms/ABC234/socket"), environment(names));

  expect(await response.text()).toBe("the match");
  expect(names).toEqual(["ABC234"]);
});

it("refuses a socket for something that is not a friend code, without asking any match", async () => {
  const names: string[] = [];
  const response = await handleApiRequest(upgrade("/api/rooms/nope/socket"), environment(names));

  expect(response.status).toBe(404);
  expect(names).toEqual([]);
});

it("asks for an upgrade when a socket is asked for without one", async () => {
  const response = await handleApiRequest(new Request("https://gunsmith.test/api/rooms/ABC234/socket"), environment());

  expect(response.status).toBe(426);
});

it("hands a weapon request to the generation route, with the pipeline it was given", async () => {
  const outcome: WeaponOutcome = {status: "rejected", reason: "not a weapon", nodes: [], modelCalls: 1};
  const response = await handleApiRequest(weaponRequest(), environment(), async () => outcome);

  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({error: "account-required"});
});

it("answers a weapon request ai-unavailable while the Worker has no pipeline", async () => {
  const response = await handleApiRequest(weaponRequest(), environment());

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-unavailable"});
});

it("refuses any way of asking for a weapon but POST", async () => {
  const response = await handleApiRequest(new Request("https://gunsmith.test/api/weapons"), environment());

  expect(response.status).toBe(405);
  expect(response.headers.get("Allow")).toBe("POST");
});

it("answers 404 to any other path", async () => {
  const response = await handleApiRequest(new Request("https://gunsmith.test/api/elsewhere"), environment());

  expect(response.status).toBe(404);
});

function environment(names: string[] = []): ApiEnvironment {
  return {
    MATCHES: matchesThatAnswer(names),
    CREDITS: unusedNamespace(),
    SPEND: unusedNamespace(),
    ALERT_MAIL: {} as SendEmail,
    ALERT_FROM_ADDRESS: "alerts@gunsmith.test",
  };
}

/** A `MATCHES` namespace whose every object answers 101 and remembers which name asked. */
function matchesThatAnswer(names: string[]): DurableObjectNamespace {
  const namespace = {
    idFromName: (name: string): string => name,
    get: (id: string): DurableObjectStub => {
      names.push(id);

      return {fetch: async () => new Response("the match", {status: 200})} as unknown as DurableObjectStub;
    },
  };

  return namespace as unknown as DurableObjectNamespace;
}

/** The two ledgers no route reads yet: a namespace that is never asked. */
function unusedNamespace<Ledger extends Rpc.DurableObjectBranded>(): DurableObjectNamespace<Ledger> {
  return {} as unknown as DurableObjectNamespace<Ledger>;
}

function upgrade(path: string): Request {
  return new Request(`https://gunsmith.test${path}`, {headers: {Upgrade: "websocket"}});
}

/** A weapon request with no account id, so the route turns it away before it asks any ledger. */
function weaponRequest(): Request {
  return new Request("https://gunsmith.test/api/weapons", {method: "POST", body: JSON.stringify({prompt: "a rifle"})});
}
