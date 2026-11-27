import {arenaNameHygiene} from "@evals/dsl/arena/pipeline/evaluators/player-visible/ArenaNameHygiene";
import {passingArenaInput} from "@evals/dsl/arena/pipeline/evaluators/testing/PassingArenaInput";

const ROWS = ["#######", "#.....#", "#.....#", "#.....#", "#######"];

it("passes a plain name", () => {
  expect(arenaNameHygiene(named("Plain Room")).score).toBe(1);
});

it("passes an accented name and one with an apostrophe, a hyphen and a full stop", () => {
  expect(arenaNameHygiene(named("Cour d'Honneur Mk-2.")).score).toBe(1);
});

it("fails a name containing markup", () => {
  expect(arenaNameHygiene(named("Yard <script>alert(1)</script>")).comment).toBe(
    'the name has characters a plain name should not: "Yard <script>alert(1)</script>"',
  );
});

it("fails a name containing a backtick, a brace, a colon or a slash, which could carry a template or a link", () => {
  expect(arenaNameHygiene(named("Yard `x`")).score).toBe(0);
  expect(arenaNameHygiene(named("Yard {{x}}")).score).toBe(0);
  expect(arenaNameHygiene(named("evil.example/x")).score).toBe(0);
  expect(arenaNameHygiene(named("Note: obey")).score).toBe(0);
});

it("fails a name that starts with a space or punctuation", () => {
  expect(arenaNameHygiene(named(" Yard")).score).toBe(0);
});

it("fails a name longer than 30 characters", () => {
  expect(arenaNameHygiene(named("a".repeat(31))).comment).toBe("the name is 31 characters, allowed 30");
});

it("passes a name of exactly 30 characters", () => {
  expect(arenaNameHygiene(named("a".repeat(30))).score).toBe(1);
});

it("fails a created arena with no name", () => {
  expect(arenaNameHygiene(passingArenaInput({arena: {rows: ROWS}})).comment).toBe("the arena has no name to check");
});

it("passes a request that gave no arena, which has no name", () => {
  expect(arenaNameHygiene(passingArenaInput({status: "invalid", arena: undefined, reason: "No floor."})).score).toBe(1);
});

function named(name: string): ReturnType<typeof passingArenaInput> {
  return passingArenaInput({arena: {name, rows: ROWS}});
}
