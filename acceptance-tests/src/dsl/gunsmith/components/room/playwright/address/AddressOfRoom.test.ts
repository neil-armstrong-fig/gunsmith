import {addressOfRoom} from "@src/dsl/gunsmith/components/room/playwright/address/AddressOfRoom";

it("is the room's page with no limits when none are given, no time to choose, and the seed that starts its fighters on known ground", () => {
  expect(addressOfRoom("ABC234")).toBe("/?room=ABC234&preRoundSeconds=0&startSeed=21");
  expect(addressOfRoom("ABC234", {})).toBe("/?room=ABC234&preRoundSeconds=0&startSeed=21");
});

it("shows each limit that is given, and only that one", () => {
  expect(addressOfRoom("ABC234", {reconnectSeconds: 2})).toBe(
    "/?room=ABC234&reconnectSeconds=2&preRoundSeconds=0&startSeed=21",
  );
  expect(addressOfRoom("ABC234", {idleSeconds: 3})).toBe("/?room=ABC234&idleSeconds=3&preRoundSeconds=0&startSeed=21");
  expect(addressOfRoom("ABC234", {reconnectSeconds: 2, idleSeconds: 3})).toBe(
    "/?room=ABC234&reconnectSeconds=2&idleSeconds=3&preRoundSeconds=0&startSeed=21",
  );
});

it("gives the two seats time to choose when a spec is about choosing", () => {
  expect(addressOfRoom("ABC234", {preRoundSeconds: 30})).toBe("/?room=ABC234&preRoundSeconds=30&startSeed=21");
});

it("escapes a code that is not plain", () => {
  expect(addressOfRoom("a/b")).toBe("/?room=a%2Fb&preRoundSeconds=0&startSeed=21");
});
