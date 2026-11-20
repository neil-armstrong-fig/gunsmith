import {addressOfRoom} from "@src/dsl/gunsmith/components/room/playwright/address/AddressOfRoom";

it("is the room's page with no limits when none are given, and the seed that starts its fighters on known ground", () => {
  expect(addressOfRoom("ABC234")).toBe("/?room=ABC234&startSeed=21");
  expect(addressOfRoom("ABC234", {})).toBe("/?room=ABC234&startSeed=21");
});

it("shows each limit that is given, and only that one", () => {
  expect(addressOfRoom("ABC234", {reconnectSeconds: 2})).toBe("/?room=ABC234&reconnectSeconds=2&startSeed=21");
  expect(addressOfRoom("ABC234", {idleSeconds: 3})).toBe("/?room=ABC234&idleSeconds=3&startSeed=21");
  expect(addressOfRoom("ABC234", {reconnectSeconds: 2, idleSeconds: 3})).toBe(
    "/?room=ABC234&reconnectSeconds=2&idleSeconds=3&startSeed=21",
  );
});

it("escapes a code that is not plain", () => {
  expect(addressOfRoom("a/b")).toBe("/?room=a%2Fb&startSeed=21");
});
