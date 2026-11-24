import {fieldOfPayload} from "@src/durable-objects/match/choices/saved-item/FieldOfPayload";

it("reads a field of an object payload", () => {
  expect(fieldOfPayload({arena: {name: "Yard"}}, "arena")).toEqual({name: "Yard"});
});

it("finds nothing in a payload that is not an object, or that lacks the field", () => {
  expect(fieldOfPayload(null, "arena")).toBeUndefined();
  expect(fieldOfPayload("arena", "arena")).toBeUndefined();
  expect(fieldOfPayload({}, "arena")).toBeUndefined();
});
