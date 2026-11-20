import {roomSocketUrl} from "@src/online/socket/RoomSocketUrl";

it("asks the page's own host over ws on a plain page", () => {
  expect(roomSocketUrl({protocol: "http:", host: "localhost:3400"}, "ABC234")).toBe(
    "ws://localhost:3400/api/rooms/ABC234/socket",
  );
});

it("uses wss on a secure page", () => {
  expect(roomSocketUrl({protocol: "https:", host: "gunsmith.example"}, "ABC234")).toBe(
    "wss://gunsmith.example/api/rooms/ABC234/socket",
  );
});

it("connects the deployed webapp to the API hostname", () => {
  expect(roomSocketUrl({protocol: "https:", host: "gunsmith.neilarmstrong.dev"}, "ABC234")).toBe(
    "wss://gunsmith-api.neilarmstrong.dev/api/rooms/ABC234/socket",
  );
});

it("carries the seat's token when it has one", () => {
  expect(roomSocketUrl({protocol: "http:", host: "h"}, "ABC234", {token: "a b&c"})).toBe(
    "ws://h/api/rooms/ABC234/socket?token=a%20b%26c",
  );
});

it("carries no token when it has none", () => {
  expect(roomSocketUrl({protocol: "http:", host: "h"}, "ABC234", {token: undefined})).toBe(
    "ws://h/api/rooms/ABC234/socket",
  );
  expect(roomSocketUrl({protocol: "http:", host: "h"}, "ABC234", {token: ""})).toBe("ws://h/api/rooms/ABC234/socket");
});

it("escapes a code that is not plain", () => {
  expect(roomSocketUrl({protocol: "http:", host: "h"}, "a/b")).toBe("ws://h/api/rooms/a%2Fb/socket");
});

it("passes on how long the page asks the room to wait, which the room's first connection sets", () => {
  expect(
    roomSocketUrl({protocol: "http:", host: "h"}, "ABC234", {search: "?room=ABC234&reconnectSeconds=2&idleSeconds=3"}),
  ).toBe("ws://h/api/rooms/ABC234/socket?reconnectSeconds=2&idleSeconds=3");
});

it("passes on the seed the page pins for the room's starts, which the room's first connection sets", () => {
  expect(roomSocketUrl({protocol: "http:", host: "h"}, "ABC234", {search: "?room=ABC234&startSeed=21"})).toBe(
    "ws://h/api/rooms/ABC234/socket?startSeed=21",
  );
});

it("passes on only those limits and that seed, and never what else the page's address says", () => {
  expect(roomSocketUrl({protocol: "http:", host: "h"}, "ABC234", {search: "?room=ABC234&lag=300&scenario=x"})).toBe(
    "ws://h/api/rooms/ABC234/socket",
  );
});

it("carries the token and the limits together", () => {
  expect(roomSocketUrl({protocol: "http:", host: "h"}, "ABC234", {token: "t", search: "?idleSeconds=3"})).toBe(
    "ws://h/api/rooms/ABC234/socket?token=t&idleSeconds=3",
  );
});

it("passes on how long the two seats have to choose, and keeps a nought, which means none", () => {
  expect(roomSocketUrl({protocol: "http:", host: "h"}, "ABC234", {search: "?room=ABC234&preRoundSeconds=0"})).toBe(
    "ws://h/api/rooms/ABC234/socket?preRoundSeconds=0",
  );
});
