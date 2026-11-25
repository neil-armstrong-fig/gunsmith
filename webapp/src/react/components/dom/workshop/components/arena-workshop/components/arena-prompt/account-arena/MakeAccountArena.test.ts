import {makeAccountArena} from "@src/react/components/dom/workshop/components/arena-workshop/components/arena-prompt/account-arena/MakeAccountArena";

const ROWS = ["##########", "#........#", "#........#", "#........#", "##########"];

afterEach(() => {
  vi.unstubAllGlobals();
});

it("sends the words and the style the player chose to the arena route", async () => {
  const fetchMock = answerWithAnArena();

  await makeAccountArena("a plain room", "red");

  expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({prompt: "a plain room", style: "red"});
});

it("sends blue when blue is the style", async () => {
  const fetchMock = answerWithAnArena();

  await makeAccountArena("a plain room", "blue");

  expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({prompt: "a plain room", style: "blue"});
});

it("refuses an invalid answer with the reason the server gave and no arena", async () => {
  stubFetchAnswering({
    status: "invalid",
    reason: "We could not build a playable arena from that request: it was too full of walls.",
  });

  await expect(makeAccountArena("a maze", "blue")).rejects.toThrow(
    "We could not build a playable arena from that request: it was too full of walls.",
  );
});

it("no longer accepts a built-in arena in the place of the one asked for", async () => {
  stubFetchAnswering({status: "builtIn", arena: {name: "Duel", rows: ROWS}, reason: "here is one of ours"});

  await expect(makeAccountArena("a maze", "blue")).rejects.toThrow("The arena response was incomplete.");
});

function stubFetchAnswering(answer: unknown): void {
  vi.stubGlobal("window", {location: {origin: "http://localhost:3000"}});
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => Response.json(answer)),
  );
}

function answerWithAnArena(): ReturnType<typeof vi.fn> {
  vi.stubGlobal("window", {location: {origin: "http://localhost:3000"}});
  const fetchMock = vi.fn(async () =>
    Response.json({status: "created", id: "arena-1", arena: {name: "Plain Room", rows: ROWS}}),
  );
  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}
