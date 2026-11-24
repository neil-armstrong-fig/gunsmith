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

it("reads a seat choosing a built-in weapon for a slot", () => {
  const text = '{"kind":"choose","step":"weapon","slot":2,"choice":{"kind":"builtIn","key":"submachine-gun"}}';

  expect(parsePreRoundMessage(text)).toEqual({
    kind: "chooseWeapon",
    slot: 2,
    choice: {kind: "builtIn", key: "submachine-gun"},
  });
});

it("reads a seat choosing a saved weapon by id", () => {
  const text = '{"kind":"choose","step":"weapon","slot":1,"choice":{"kind":"saved","id":"weapon-1"}}';

  expect(parsePreRoundMessage(text)).toEqual({kind: "chooseWeapon", slot: 1, choice: {kind: "saved", id: "weapon-1"}});
});

it("reads a seat locking in the weapon in a slot", () => {
  expect(parsePreRoundMessage('{"kind":"lockIn","step":"weapon","slot":1}')).toEqual({kind: "lockInWeapon", slot: 1});
  expect(parsePreRoundMessage('{"kind":"lockIn","step":"weapon","slot":2}')).toEqual({kind: "lockInWeapon", slot: 2});
});

it("does not take a weapon for a slot that is not 1 or 2, or with none", () => {
  const choice = '"choice":{"kind":"builtIn","key":"rifle"}';

  expect(parsePreRoundMessage(`{"kind":"choose","step":"weapon","slot":3,${choice}}`)).toBeUndefined();
  expect(parsePreRoundMessage(`{"kind":"choose","step":"weapon","slot":"1",${choice}}`)).toBeUndefined();
  expect(parsePreRoundMessage(`{"kind":"choose","step":"weapon",${choice}}`)).toBeUndefined();
  expect(parsePreRoundMessage('{"kind":"lockIn","step":"weapon","slot":0}')).toBeUndefined();
  expect(parsePreRoundMessage('{"kind":"lockIn","step":"weapon"}')).toBeUndefined();
});

it("does not take the old pair of weapons: weapons are chosen one at a time", () => {
  const pair =
    '{"kind":"choose","step":"weapons","choice":[{"kind":"builtIn","key":"rifle"},{"kind":"builtIn","key":"rifle"}]}';

  expect(parsePreRoundMessage(pair)).toBeUndefined();
  expect(parsePreRoundMessage('{"kind":"lockIn","step":"weapons"}')).toBeUndefined();
});

it("does not take a weapon that is not a built-in key or a saved id", () => {
  const at = (choice: string): string => `{"kind":"choose","step":"weapon","slot":1,"choice":${choice}}`;

  expect(parsePreRoundMessage(at('{"kind":"saved"}'))).toBeUndefined();
  expect(parsePreRoundMessage(at('{"kind":"saved","id":7}'))).toBeUndefined();
  expect(parsePreRoundMessage(at('{"kind":"saved","id":""}'))).toBeUndefined();
  expect(parsePreRoundMessage(at(`{"kind":"saved","id":"${"x".repeat(65)}"}`))).toBeUndefined();
  expect(parsePreRoundMessage(at('{"kind":"saved","key":"rifle"}'))).toBeUndefined();
  expect(parsePreRoundMessage(at('{"kind":"builtIn","key":7}'))).toBeUndefined();
  expect(parsePreRoundMessage(at('[{"kind":"builtIn","key":"rifle"}]'))).toBeUndefined();
  expect(parsePreRoundMessage('{"kind":"choose","step":"weapon","slot":1}')).toBeUndefined();
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
