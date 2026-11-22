import {addressOfPracticeRange} from "@src/dsl/gunsmith/components/room/components/room-entry/playwright/address/AddressOfPracticeRange";

it("is the practice range with the room's defaults on it and no room", () => {
  expect(addressOfPracticeRange()).toBe("/?preRoundSeconds=0&startSeed=21");
});

it("shows each limit that is given, as a room's own address does", () => {
  expect(addressOfPracticeRange({idleSeconds: 3, ringDelaySeconds: 2})).toBe(
    "/?idleSeconds=3&preRoundSeconds=0&startSeed=21&ringDelay=2",
  );
});

it("gives the time to choose when a spec is about choosing", () => {
  expect(addressOfPracticeRange({preRoundSeconds: 30})).toBe("/?preRoundSeconds=30&startSeed=21");
});
