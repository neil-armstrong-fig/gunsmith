import {roomAddressOf} from "@src/react/components/dom/front-door/components/room-entry/room-address/RoomAddressOf";

it("is the room's page", () => {
  expect(roomAddressOf("ABC234", "")).toBe("/?room=ABC234");
});

it("keeps the page's own query, which tunes the room", () => {
  expect(roomAddressOf("ABC234", "?preRoundSeconds=0&startSeed=21")).toBe(
    "/?preRoundSeconds=0&startSeed=21&room=ABC234",
  );
});

it("replaces a room the page already named", () => {
  expect(roomAddressOf("ABC234", "?room=ZZZ999&startSeed=21")).toBe("/?room=ABC234&startSeed=21");
});
