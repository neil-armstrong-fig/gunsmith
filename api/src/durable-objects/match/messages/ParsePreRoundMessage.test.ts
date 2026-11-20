import {parsePreRoundMessage} from "@src/durable-objects/match/messages/ParsePreRoundMessage";

it("reads a seat choosing a built-in arena", () => {
  const text = '{"kind":"choose","step":"arena","choice":{"kind":"builtIn","name":"Fair duel"}}';

  expect(parsePreRoundMessage(text)).toEqual({kind: "chooseArena", name: "Fair duel"});
});

it("reads a seat locking in its arena", () => {
  expect(parsePreRoundMessage('{"kind":"lockIn","step":"arena"}')).toEqual({kind: "lockInArena"});
});

it("reads a seat choosing two built-in weapons, slot 1 then slot 2", () => {
  const text =
    '{"kind":"choose","step":"weapons","choice":[{"kind":"builtIn","key":"submachine-gun"},{"kind":"builtIn","key":"rifle"}]}';

  expect(parsePreRoundMessage(text)).toEqual({kind: "chooseWeapons", keys: ["submachine-gun", "rifle"]});
});

it("reads a seat locking in its weapons", () => {
  expect(parsePreRoundMessage('{"kind":"lockIn","step":"weapons"}')).toEqual({kind: "lockInWeapons"});
});

it("does not take weapons that are not exactly two built-in keys", () => {
  const one = '{"kind":"choose","step":"weapons","choice":[{"kind":"builtIn","key":"rifle"}]}';
  const three =
    '{"kind":"choose","step":"weapons","choice":[{"kind":"builtIn","key":"a"},{"kind":"builtIn","key":"b"},{"kind":"builtIn","key":"c"}]}';
  const saved =
    '{"kind":"choose","step":"weapons","choice":[{"kind":"builtIn","key":"rifle"},{"kind":"saved","id":"abc"}]}';
  const number =
    '{"kind":"choose","step":"weapons","choice":[{"kind":"builtIn","key":"rifle"},{"kind":"builtIn","key":7}]}';

  expect(parsePreRoundMessage(one)).toBeUndefined();
  expect(parsePreRoundMessage(three)).toBeUndefined();
  expect(parsePreRoundMessage(saved)).toBeUndefined();
  expect(
    parsePreRoundMessage(
      '{"kind":"choose","step":"weapons","choice":[{"kind":"builtIn","key":"rifle"},{"kind":"saved","key":"rifle"}]}',
    ),
  ).toBeUndefined();
  expect(parsePreRoundMessage(number)).toBeUndefined();
  expect(
    parsePreRoundMessage('{"kind":"choose","step":"weapons","choice":{"kind":"builtIn","key":"rifle"}}'),
  ).toBeUndefined();
  expect(parsePreRoundMessage('{"kind":"choose","step":"weapons"}')).toBeUndefined();
});

it("reads a pick of one of the two arenas", () => {
  const text = '{"kind":"pickArena","pick":{"kind":"arena","seat":"second"}}';

  expect(parsePreRoundMessage(text)).toEqual({kind: "pickArena", pick: {kind: "arena", seat: "second"}});
});

it("reads a pick of random and a pick of nothing", () => {
  expect(parsePreRoundMessage('{"kind":"pickArena","pick":{"kind":"random"}}')).toEqual({
    kind: "pickArena",
    pick: {kind: "random"},
  });
  expect(parsePreRoundMessage('{"kind":"pickArena","pick":{"kind":"nothing"}}')).toEqual({
    kind: "pickArena",
    pick: {kind: "nothing"},
  });
});

it("reads only the arena step", () => {
  expect(parsePreRoundMessage('{"kind":"lockIn","step":"weapon1"}')).toBeUndefined();
  expect(
    parsePreRoundMessage('{"kind":"choose","step":"weapon1","choice":{"kind":"builtIn","name":"Rifle"}}'),
  ).toBeUndefined();
});

it("does not take a choice that is not a built-in name", () => {
  expect(parsePreRoundMessage('{"kind":"choose","step":"arena","choice":{"kind":"saved","id":"abc"}}')).toBeUndefined();
  expect(parsePreRoundMessage('{"kind":"choose","step":"arena","choice":{"kind":"builtIn","name":7}}')).toBeUndefined();
  expect(parsePreRoundMessage('{"kind":"choose","step":"arena"}')).toBeUndefined();
});

it("does not take a pick that names no seat or an unknown kind", () => {
  expect(parsePreRoundMessage('{"kind":"pickArena","pick":{"kind":"arena","seat":"third"}}')).toBeUndefined();
  expect(parsePreRoundMessage('{"kind":"pickArena","pick":{"kind":"arena"}}')).toBeUndefined();
  expect(parsePreRoundMessage('{"kind":"pickArena","pick":{"kind":"coin"}}')).toBeUndefined();
  expect(parsePreRoundMessage('{"kind":"pickArena"}')).toBeUndefined();
});

it("does not take another kind of message or text that is not an object", () => {
  expect(parsePreRoundMessage('{"kind":"ready"}')).toBeUndefined();
  expect(parsePreRoundMessage("lockIn")).toBeUndefined();
  expect(parsePreRoundMessage("null")).toBeUndefined();
  expect(parsePreRoundMessage('["lockIn"]')).toBeUndefined();
});
