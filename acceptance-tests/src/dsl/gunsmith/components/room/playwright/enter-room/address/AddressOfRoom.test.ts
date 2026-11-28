import {addressOfRoom} from "@src/dsl/gunsmith/components/room/playwright/enter-room/address/AddressOfRoom";

it("is the room's page with no limits when none are given, no time to choose, and the seed that starts its fighters on known ground", () => {
  expect(addressOfRoom("ABC234")).toBe(
    "/?room=ABC234&preRoundSeconds=0&revealSeconds=0&startSeed=21&arenaRotation=off",
  );
  expect(addressOfRoom("ABC234", {})).toBe(
    "/?room=ABC234&preRoundSeconds=0&revealSeconds=0&startSeed=21&arenaRotation=off",
  );
});

it("shows each limit that is given, and only that one", () => {
  expect(addressOfRoom("ABC234", {reconnectSeconds: 2})).toBe(
    "/?room=ABC234&reconnectSeconds=2&preRoundSeconds=0&revealSeconds=0&startSeed=21&arenaRotation=off",
  );
  expect(addressOfRoom("ABC234", {idleSeconds: 3})).toBe(
    "/?room=ABC234&idleSeconds=3&preRoundSeconds=0&revealSeconds=0&startSeed=21&arenaRotation=off",
  );
  expect(addressOfRoom("ABC234", {reconnectSeconds: 2, idleSeconds: 3})).toBe(
    "/?room=ABC234&reconnectSeconds=2&idleSeconds=3&preRoundSeconds=0&revealSeconds=0&startSeed=21&arenaRotation=off",
  );
});

it("gives the two seats time to choose when a spec is about choosing", () => {
  expect(addressOfRoom("ABC234", {preRoundSeconds: 30})).toBe(
    "/?room=ABC234&preRoundSeconds=30&revealSeconds=0&startSeed=21&arenaRotation=off",
  );
});

it("shows the ring's timing when a spec is about the ring, so a round need not last 75 seconds", () => {
  expect(addressOfRoom("ABC234", {ringDelaySeconds: 2, ringClosingSeconds: 6})).toBe(
    "/?room=ABC234&preRoundSeconds=0&revealSeconds=0&startSeed=21&arenaRotation=off&ringDelay=2&ringClosing=6",
  );
  expect(addressOfRoom("ABC234", {ringDelaySeconds: 0})).toBe(
    "/?room=ABC234&preRoundSeconds=0&revealSeconds=0&startSeed=21&arenaRotation=off&ringDelay=0",
  );
});

it("starts the fighters from another seed when a spec needs the weapon on a straight walk from them", () => {
  expect(addressOfRoom("ABC234", {startSeed: 131})).toBe(
    "/?room=ABC234&preRoundSeconds=0&revealSeconds=0&startSeed=131&arenaRotation=off",
  );
});

it("offers only the day's arenas when a spec is about them; otherwise every arena, so a room with no time to choose is on the Duel", () => {
  expect(addressOfRoom("ABC234", {daysArenas: true})).toBe(
    "/?room=ABC234&preRoundSeconds=0&revealSeconds=0&startSeed=21",
  );
  expect(addressOfRoom("ABC234", {daysArenas: false})).toBe(
    "/?room=ABC234&preRoundSeconds=0&revealSeconds=0&startSeed=21&arenaRotation=off",
  );
});

it("escapes a code that is not plain", () => {
  expect(addressOfRoom("a/b")).toBe("/?room=a%2Fb&preRoundSeconds=0&revealSeconds=0&startSeed=21&arenaRotation=off");
});
