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

it("escapes a code that is not plain", () => {
  expect(roomSocketUrl({protocol: "http:", host: "h"}, "a/b")).toBe("ws://h/api/rooms/a%2Fb/socket");
});
