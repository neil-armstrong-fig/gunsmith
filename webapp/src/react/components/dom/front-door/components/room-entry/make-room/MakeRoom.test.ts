import {makeRoom} from "@src/react/components/dom/front-door/components/room-entry/make-room/MakeRoom";

const PAGE = {protocol: "http:", host: "localhost:3400"};

afterEach(() => {
  vi.unstubAllGlobals();
});

it("asks the server for a room with the page's credentials and answers its friend code", async () => {
  const fetchMock = vi.fn().mockResolvedValue(Response.json({code: "ABC234"}, {status: 201}));
  vi.stubGlobal("fetch", fetchMock);

  expect(await makeRoom(PAGE)).toBe("ABC234");
  expect(fetchMock).toHaveBeenCalledWith("http://localhost:3400/api/rooms", {method: "POST", credentials: "include"});
});

it("is nothing when the server answers with an error", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({error: "unavailable"}, {status: 500})));

  expect(await makeRoom(PAGE)).toBeUndefined();
});

it("trusts the status, not only the body: an error that carries a code is no room", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({code: "ABC234"}, {status: 503})));

  expect(await makeRoom(PAGE)).toBeUndefined();
});

it("is nothing when the server cannot be reached", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

  expect(await makeRoom(PAGE)).toBeUndefined();
});

it("is nothing when the answer carries no friend code", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({code: 7}, {status: 201})));

  expect(await makeRoom(PAGE)).toBeUndefined();
});
