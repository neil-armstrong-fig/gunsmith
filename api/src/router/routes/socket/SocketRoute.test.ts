import type {ApiEnvironment} from "@src/env/types/ApiEnvironment";
import {socketRoute} from "@src/router/routes/socket/SocketRoute";

it("hands a WebSocket upgrade to the match of that code", async () => {
  const names: string[] = [];
  const response = await socketRoute(upgrade(), environment(names), "ABC234");

  expect(await response.text()).toBe("the match");
  expect(names).toEqual(["ABC234"]);
});

it("refuses a socket for something that is not a friend code, without asking any match", async () => {
  const names: string[] = [];
  const response = await socketRoute(upgrade(), environment(names), "nope");

  expect(response.status).toBe(404);
  expect(names).toEqual([]);
});

it("asks for an upgrade when a socket is asked for without one", async () => {
  const response = await socketRoute(
    new Request("https://gunsmith.test/api/rooms/ABC234/socket"),
    environment(),
    "ABC234",
  );

  expect(response.status).toBe(426);
});

function environment(names: string[] = []): ApiEnvironment {
  return {MATCHES: matchesThatAnswer(names)} as unknown as ApiEnvironment;
}

/** A `MATCHES` namespace whose every object answers 200 and remembers which name asked. */
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

function upgrade(): Request {
  return new Request("https://gunsmith.test/api/rooms/ABC234/socket", {headers: {Upgrade: "websocket"}});
}
