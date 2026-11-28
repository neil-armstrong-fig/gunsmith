import {workerEnvironment} from "@src/shared/env/WorkerEnvironment";
import {signInPlayer} from "@src/router/routes/shared/fake-accounts/SignInPlayer";
import {SEAT_ACCOUNT_HEADER} from "@src/shared/seat-account/SeatAccountHeader";
import {socketRoute} from "@src/router/routes/socket/SocketRoute";

it("hands a WebSocket upgrade to the match of that code", async () => {
  const names: string[] = [];
  useMatches(names);
  const response = await socketRoute(upgrade(), "ABC234");

  expect(await response.text()).toBe("the match");
  expect(names).toEqual(["ABC234"]);
});

it("refuses a socket for something that is not a friend code, without asking any match", async () => {
  const names: string[] = [];
  useMatches(names);
  const response = await socketRoute(upgrade(), "nope");

  expect(response.status).toBe(404);
  expect(names).toEqual([]);
});

it("asks for an upgrade when a socket is asked for without one", async () => {
  const response = await socketRoute(new Request("https://gunsmith.test/api/rooms/ABC234/socket"), "ABC234");

  expect(response.status).toBe(426);
});

it("tells the match whose session the socket came with, in a header only the Worker sets", async () => {
  const requests = useMatchesThatKeepRequests();
  const player = await signInPlayer();

  await socketRoute(upgrade({Cookie: player.cookie}), "ABC234");

  expect(requests[0]?.headers.get(SEAT_ACCOUNT_HEADER)).toBe(player.account.id);
});

it("tells the match nobody for a guest, or for a cookie that proves nobody", async () => {
  const requests = useMatchesThatKeepRequests();

  await socketRoute(upgrade(), "ABC234");
  await socketRoute(upgrade({Cookie: "session=not-a-token-we-gave"}), "ABC234");

  expect(requests.map(request => request.headers.get(SEAT_ACCOUNT_HEADER))).toEqual([null, null]);
});

it("drops an account a page names for itself: naming one proves nobody", async () => {
  const requests = useMatchesThatKeepRequests();
  const player = await signInPlayer();

  await socketRoute(upgrade({[SEAT_ACCOUNT_HEADER]: "someone-else"}), "ABC234");
  await socketRoute(upgrade({[SEAT_ACCOUNT_HEADER]: "someone-else", Cookie: player.cookie}), "ABC234");

  expect(requests.map(request => request.headers.get(SEAT_ACCOUNT_HEADER))).toEqual([null, player.account.id]);
});

it("hands the match the same upgrade it was given, address and all", async () => {
  const requests = useMatchesThatKeepRequests();

  await socketRoute(upgrade({}, "?token=abc&preRoundSeconds=0"), "ABC234");

  expect(requests[0]?.url).toBe("https://gunsmith.test/api/rooms/ABC234/socket?token=abc&preRoundSeconds=0");
  expect(requests[0]?.headers.get("Upgrade")).toBe("websocket");
});

function useMatches(names: string[]): void {
  workerEnvironment.MATCHES = matchesThatAnswer(names, []);
}

function useMatchesThatKeepRequests(): Request[] {
  const requests: Request[] = [];
  workerEnvironment.MATCHES = matchesThatAnswer([], requests);

  return requests;
}

/** A `MATCHES` namespace whose every object answers 200, remembers which name asked and keeps the request it was handed. */
function matchesThatAnswer(names: string[], requests: Request[]): DurableObjectNamespace {
  const namespace = {
    idFromName: (name: string): string => name,
    get: (id: string): DurableObjectStub => {
      names.push(id);

      return {
        fetch: async (request: Request) => {
          requests.push(request);

          return new Response("the match", {status: 200});
        },
      } as unknown as DurableObjectStub;
    },
  };

  return namespace as unknown as DurableObjectNamespace;
}

function upgrade(headers: Record<string, string> = {}, search = ""): Request {
  return new Request(`https://gunsmith.test/api/rooms/ABC234/socket${search}`, {
    headers: {Upgrade: "websocket", ...headers},
  });
}
