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

it("carries the seat's token when it has one", () => {
  expect(roomSocketUrl({protocol: "http:", host: "h"}, "ABC234", "a b&c")).toBe(
    "ws://h/api/rooms/ABC234/socket?token=a%20b%26c",
  );
});

it("carries no token when it has none", () => {
  expect(roomSocketUrl({protocol: "http:", host: "h"}, "ABC234", undefined)).toBe("ws://h/api/rooms/ABC234/socket");
  expect(roomSocketUrl({protocol: "http:", host: "h"}, "ABC234", "")).toBe("ws://h/api/rooms/ABC234/socket");
});

it("escapes a code that is not plain", () => {
  expect(roomSocketUrl({protocol: "http:", host: "h"}, "a/b")).toBe("ws://h/api/rooms/a%2Fb/socket");
});
