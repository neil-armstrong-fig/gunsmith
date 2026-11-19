import {parseReadyMessage} from "@src/durable-objects/match/messages/ParseReadyMessage";

it("reads a ready message", () => {
  expect(parseReadyMessage('{"kind":"ready"}')).toBe(true);
});

it("reads a ready message with extra fields, which are ignored", () => {
  expect(parseReadyMessage('{"kind":"ready","seq":3}')).toBe(true);
});

it("does not take another kind of message for one", () => {
  expect(parseReadyMessage('{"kind":"input","seq":1}')).toBe(false);
});

it("does not take text that is not an object for one", () => {
  expect(parseReadyMessage("ready")).toBe(false);
  expect(parseReadyMessage("null")).toBe(false);
  expect(parseReadyMessage('["ready"]')).toBe(false);
  expect(parseReadyMessage("")).toBe(false);
});
