import {scenarioFromSearch} from "@src/game/scenario/ScenarioFromSearch";

it("asks for the practice range when the query is empty", () => {
  expect(scenarioFromSearch("")).toBe("practice");
});

it("asks for the duel when the query says so", () => {
  expect(scenarioFromSearch("?scenario=duel")).toBe("duel");
});

it("finds the scenario among other parameters", () => {
  expect(scenarioFromSearch("?a=1&scenario=duel&b=2")).toBe("duel");
});

it("falls back to the practice range for a scenario it does not know", () => {
  expect(scenarioFromSearch("?scenario=chess")).toBe("practice");
});

it("asks for the practice range when it is named", () => {
  expect(scenarioFromSearch("?scenario=practice")).toBe("practice");
});

it("asks for an online room when the query names one, whatever scenario it also names", () => {
  expect(scenarioFromSearch("?room=ABC234")).toBe("room");
  expect(scenarioFromSearch("?scenario=duel&room=ABC234")).toBe("room");
});

it("does not ask for a room when the room is empty", () => {
  expect(scenarioFromSearch("?room=")).toBe("practice");
});

it("asks for the sparring match when the query says so", () => {
  expect(scenarioFromSearch("?scenario=sparring")).toBe("sparring");
});

it("asks for the heights arena when the query says so", () => {
  expect(scenarioFromSearch("?scenario=heights")).toBe("heights");
});

it("asks for the cover arena when the query says so", () => {
  expect(scenarioFromSearch("?scenario=cover")).toBe("cover");
});

it("asks for the terraced duel when the query says so", () => {
  expect(scenarioFromSearch("?scenario=terraced")).toBe("terraced");
});

it("asks for the overlook duel when the query says so", () => {
  expect(scenarioFromSearch("?scenario=overlook")).toBe("overlook");
});

it("asks for the overwatch when the query says so", () => {
  expect(scenarioFromSearch("?scenario=overwatch")).toBe("overwatch");
});

it("asks for the pickup race when the query says so", () => {
  expect(scenarioFromSearch("?scenario=pickup-race")).toBe("pickup-race");
});

it("asks for the fair duel when the query says so", () => {
  expect(scenarioFromSearch("?scenario=fair-duel")).toBe("fair-duel");
});
