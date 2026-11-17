import {roomOfPage} from "@src/online/RoomOfPage";

afterEach(() => {
  vi.unstubAllGlobals();
});

it("reads the room the page was opened for", () => {
  vi.stubGlobal("location", {search: "?a=1&room=ABC234"});

  expect(roomOfPage()).toBe("ABC234");
});

it("has none for a page that names none, or an empty one", () => {
  vi.stubGlobal("location", {search: "?scenario=duel"});
  expect(roomOfPage()).toBeUndefined();

  vi.stubGlobal("location", {search: "?room="});
  expect(roomOfPage()).toBeUndefined();
});

it("has none outside a browser", () => {
  expect(roomOfPage()).toBeUndefined();
});
