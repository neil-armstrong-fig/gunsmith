import {parsePreRoundMessage} from "@src/durable-objects/match/messages/ParsePreRoundMessage";

it("reads a seat choosing a built-in arena", () => {
  const text = '{"kind":"choose","step":"arena","choice":{"kind":"builtIn","name":"Fair duel"}}';

  expect(parsePreRoundMessage(text)).toEqual({kind: "chooseArena", choice: {kind: "builtIn", name: "Fair duel"}});
});

it("reads a seat choosing a saved arena by id", () => {
  const text = '{"kind":"choose","step":"arena","choice":{"kind":"saved","id":"6f1c0a52-3b1e-4a63-9d1a-0c5b2f7e8d11"}}';

  expect(parsePreRoundMessage(text)).toEqual({
    kind: "chooseArena",
    choice: {kind: "saved", id: "6f1c0a52-3b1e-4a63-9d1a-0c5b2f7e8d11"},
  });
});

it("reads a seat locking in its arena", () => {
  expect(parsePreRoundMessage('{"kind":"lockIn","step":"arena"}')).toEqual({kind: "lockInArena"});
});

it("reads a seat choosing two built-in weapons, slot 1 then slot 2", () => {
  const text =
    '{"kind":"choose","step":"weapons","choice":[{"kind":"builtIn","key":"submachine-gun"},{"kind":"builtIn","key":"rifle"}]}';

  expect(parsePreRoundMessage(text)).toEqual({
    kind: "chooseWeapons",
    choices: [
      {kind: "builtIn", key: "submachine-gun"},
      {kind: "builtIn", key: "rifle"},
    ],
  });
});

it("reads a seat choosing saved weapons by id, alone or beside a built-in", () => {
  const text =
    '{"kind":"choose","step":"weapons","choice":[{"kind":"saved","id":"weapon-1"},{"kind":"builtIn","key":"rifle"}]}';
  const both =
    '{"kind":"choose","step":"weapons","choice":[{"kind":"saved","id":"weapon-1"},{"kind":"saved","id":"weapon-2"}]}';

  expect(parsePreRoundMessage(text)).toEqual({
    kind: "chooseWeapons",
    choices: [
      {kind: "saved", id: "weapon-1"},
      {kind: "builtIn", key: "rifle"},
    ],
  });
  expect(parsePreRoundMessage(both)).toEqual({
    kind: "chooseWeapons",
    choices: [
      {kind: "saved", id: "weapon-1"},
      {kind: "saved", id: "weapon-2"},
    ],
  });
});

it("reads a seat locking in its weapons", () => {
  expect(parsePreRoundMessage('{"kind":"lockIn","step":"weapons"}')).toEqual({kind: "lockInWeapons"});
});

it("does not take weapons that are not exactly two choices, each a built-in key or a saved id", () => {
  const one = '{"kind":"choose","step":"weapons","choice":[{"kind":"builtIn","key":"rifle"}]}';
  const three =
    '{"kind":"choose","step":"weapons","choice":[{"kind":"builtIn","key":"a"},{"kind":"builtIn","key":"b"},{"kind":"builtIn","key":"c"}]}';
  const savedWithoutId =
    '{"kind":"choose","step":"weapons","choice":[{"kind":"builtIn","key":"rifle"},{"kind":"saved"}]}';
  const savedWithNumber =
    '{"kind":"choose","step":"weapons","choice":[{"kind":"builtIn","key":"rifle"},{"kind":"saved","id":7}]}';
  const savedWithEmptyId =
    '{"kind":"choose","step":"weapons","choice":[{"kind":"builtIn","key":"rifle"},{"kind":"saved","id":""}]}';
  const savedWithLongId = `{"kind":"choose","step":"weapons","choice":[{"kind":"builtIn","key":"rifle"},{"kind":"saved","id":"${"x".repeat(65)}"}]}`;
  const number =
    '{"kind":"choose","step":"weapons","choice":[{"kind":"builtIn","key":"rifle"},{"kind":"builtIn","key":7}]}';

  expect(parsePreRoundMessage(one)).toBeUndefined();
  expect(parsePreRoundMessage(three)).toBeUndefined();
  expect(parsePreRoundMessage(savedWithoutId)).toBeUndefined();
  expect(parsePreRoundMessage(savedWithNumber)).toBeUndefined();
  expect(parsePreRoundMessage(savedWithEmptyId)).toBeUndefined();
  expect(parsePreRoundMessage(savedWithLongId)).toBeUndefined();
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

it("does not take an arena choice that is not a built-in name or a saved id", () => {
  expect(parsePreRoundMessage('{"kind":"choose","step":"arena","choice":{"kind":"saved"}}')).toBeUndefined();
  expect(parsePreRoundMessage('{"kind":"choose","step":"arena","choice":{"kind":"saved","id":""}}')).toBeUndefined();
  expect(
    parsePreRoundMessage('{"kind":"choose","step":"arena","choice":{"kind":"saved","name":"Duel"}}'),
  ).toBeUndefined();
  expect(parsePreRoundMessage('{"kind":"choose","step":"arena","choice":{"kind":"mine","id":"abc"}}')).toBeUndefined();
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
