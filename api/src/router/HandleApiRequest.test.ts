import type {ArenaOutcome} from "@gunsmith/ai/pipeline/arena/types/ArenaOutcome";
import type {WeaponOutcome} from "@gunsmith/ai/pipeline/types/WeaponOutcome";
import type {ApiEnvironment} from "@src/env/types/ApiEnvironment";
import {handleApiRequest} from "@src/router/HandleApiRequest";

it("hands a room request to the room route", async () => {
  const response = await handleApiRequest(
    new Request("https://gunsmith.test/api/rooms", {method: "POST"}),
    environment(),
  );

  expect(response.status).toBe(201);
});

it("hands a socket request to the socket route, with the code in the path", async () => {
  const names: string[] = [];
  const response = await handleApiRequest(upgrade("/api/rooms/ABC234/socket"), environment(names));

  expect(await response.text()).toBe("the match");
  expect(names).toEqual(["ABC234"]);
});

it("hands a weapon request to the generation route, with the pipeline it was given", async () => {
  const outcome: WeaponOutcome = {status: "rejected", reason: "not a weapon", nodes: [], modelCalls: 1};
  const response = await handleApiRequest(weaponRequest(), environment(), {weaponSmith: async () => outcome});

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

it("hands an arena request to its own generation route, with the pipeline it was given", async () => {
  const outcome: ArenaOutcome = {status: "rejected", reason: "not an arena", refunded: false, nodes: [], modelCalls: 1};
  const response = await handleApiRequest(arenaRequest(), environment(), {arenaSmith: async () => outcome});

  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({error: "account-required"});
});

it("answers an arena request ai-unavailable when only the weapon pipeline exists", async () => {
  const response = await handleApiRequest(arenaRequest(), environment(), {weaponSmith: async () => weaponOutcome});

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-unavailable"});
});

it("answers a weapon request ai-unavailable when only the arena pipeline exists", async () => {
  const response = await handleApiRequest(weaponRequest(), environment(), {arenaSmith: async () => arenaOutcome});

  expect(response.status).toBe(503);
  expect(await response.json()).toEqual({error: "ai-unavailable"});
});

it("refuses any way of asking for an arena but POST", async () => {
  const response = await handleApiRequest(new Request("https://gunsmith.test/api/arenas"), environment());

  expect(response.status).toBe(405);
  expect(response.headers.get("Allow")).toBe("POST");
});

it("answers 404 to any other path", async () => {
  const response = await handleApiRequest(new Request("https://gunsmith.test/api/elsewhere"), environment());

  expect(response.status).toBe(404);
});

const weaponOutcome: WeaponOutcome = {status: "rejected", reason: "not a weapon", nodes: [], modelCalls: 1};

const arenaOutcome: ArenaOutcome = {
  status: "rejected",
  reason: "not an arena",
  refunded: false,
  nodes: [],
  modelCalls: 1,
};

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

/** An arena request with no account id, so the route turns it away before it asks any ledger. */
function arenaRequest(): Request {
  return new Request("https://gunsmith.test/api/arenas", {method: "POST", body: JSON.stringify({prompt: "a maze"})});
}
