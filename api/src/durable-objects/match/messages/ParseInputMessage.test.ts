import {parseInputMessage} from "@src/durable-objects/match/messages/ParseInputMessage";

const GOOD = {kind: "input", seq: 5, direction: {x: 1, y: 0}, firing: false, reload: false};

it("reads an input message", () => {
  expect(parseInputMessage(frame({aimAt: {x: 3, y: 4}, crouching: true, switchTo: 2, firing: true}))).toEqual({
    seq: 5,
    input: {
      direction: {x: 1, y: 0},
      aimAt: {x: 3, y: 4},
      firing: true,
      crouching: true,
      reload: false,
      switchTo: 2,
    },
  });
});

it("leaves out what the message leaves out", () => {
  const input = parseInputMessage(frame({}))?.input;

  expect(input?.aimAt).toBeUndefined();
  expect(input?.crouching).toBeUndefined();
  expect(input?.switchTo).toBeUndefined();
});

it("refuses a frame that is not JSON, not an object, or not an input", () => {
  expect(parseInputMessage("nope")).toBeUndefined();
  expect(parseInputMessage("[]")).toBeUndefined();
  expect(parseInputMessage("null")).toBeUndefined();
  expect(parseInputMessage(frame({kind: "snapshot"}))).toBeUndefined();
});

it("refuses a field of the wrong kind", () => {
  expect(parseInputMessage(frame({direction: {x: "1", y: 0}}))).toBeUndefined();
  expect(parseInputMessage(frame({direction: undefined}))).toBeUndefined();
  expect(parseInputMessage(frame({firing: "yes"}))).toBeUndefined();
  expect(parseInputMessage(frame({reload: 1}))).toBeUndefined();
  expect(parseInputMessage(frame({aimAt: {x: 1}}))).toBeUndefined();
  expect(parseInputMessage(frame({crouching: "no"}))).toBeUndefined();
  expect(parseInputMessage(frame({switchTo: 1.5}))).toBeUndefined();
});

it("refuses a sequence number that is missing, fractional, negative or too large to count", () => {
  expect(parseInputMessage(frame({seq: undefined}))).toBeUndefined();
  expect(parseInputMessage(frame({seq: "5"}))).toBeUndefined();
  expect(parseInputMessage(frame({seq: 1.5}))).toBeUndefined();
  expect(parseInputMessage(frame({seq: -1}))).toBeUndefined();
  expect(parseInputMessage(frame({seq: 2 ** 53}))).toBeUndefined();
});

it("accepts a sequence number of zero", () => {
  expect(parseInputMessage(frame({seq: 0}))?.seq).toBe(0);
});

it("refuses a number that is not finite", () => {
  expect(
    parseInputMessage('{"kind":"input","seq":1,"direction":{"x":1e999,"y":0},"firing":false,"reload":false}'),
  ).toBeUndefined();
});

function frame(overrides: Record<string, unknown>): string {
  return JSON.stringify({...GOOD, ...overrides});
}
