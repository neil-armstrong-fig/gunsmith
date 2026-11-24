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

function answerWithAnArena(): ReturnType<typeof vi.fn> {
  vi.stubGlobal("window", {location: {origin: "http://localhost:3000"}});
  const fetchMock = vi.fn(async () =>
    Response.json({status: "created", id: "arena-1", arena: {name: "Plain Room", rows: ROWS}}),
  );
  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}
