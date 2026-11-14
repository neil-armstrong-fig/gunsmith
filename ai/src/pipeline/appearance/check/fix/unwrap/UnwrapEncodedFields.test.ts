import {unwrapEncodedFields} from "@gunsmith/ai/pipeline/appearance/check/fix/unwrap/UnwrapEncodedFields";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";

it("reads a body the model wrote as text, and says it did", () => {
  const source = passingAppearance();
  const encoded = {...source, body: JSON.stringify(source.body)};

  expect(unwrapEncodedFields(encoded)).toEqual({candidate: source, changes: ["body"]});
});

it.each([
  ["projectile", "[]"],
  ["palette", '{"accent":"weapon-blue","accent-secondary":"weapon-orange"}'],
  ["impact", '{"preset":"spark","colour":"accent"}'],
  ["animation", '{"preset":"none"}'],
])("reads %s written as text", (field, encoded) => {
  const source = passingAppearance();
  const result = unwrapEncodedFields({...source, [field]: encoded});

  expect(result).toEqual({candidate: source, changes: [field]});
});

it("reads the points of a part written as text", () => {
  const source = passingAppearance();
  const body = source.body as Record<string, unknown>[];
  const encoded = {...source, body: [body[0], body[1], {...body[2], points: JSON.stringify(body[2]?.points)}]};

  expect(unwrapEncodedFields(encoded)).toEqual({candidate: source, changes: ["body.points"]});
});

it("reads the points of a projectile part written as text", () => {
  const source = passingAppearance();
  const part = (source.body as Record<string, unknown>[])[2] ?? {};
  const encoded = {...source, projectile: [{...part, points: JSON.stringify(part.points)}]};

  expect(unwrapEncodedFields(encoded)).toEqual({
    candidate: {...source, projectile: [part]},
    changes: ["projectile.points"],
  });
});

it("reads the points of a part inside a body that was itself written as text", () => {
  const source = passingAppearance();
  const body = source.body as Record<string, unknown>[];
  const inner = [body[0], {...body[2], points: JSON.stringify(body[2]?.points)}];
  const result = unwrapEncodedFields({...source, body: JSON.stringify(inner)});

  expect(result.candidate).toEqual({...source, body: [body[0], body[2]]});
  expect(result.changes).toEqual(["body", "body.points"]);
});

it("leaves text that is not JSON alone, for the strict check to refuse", () => {
  const candidate = {...passingAppearance(), body: "[{not json"};

  expect(unwrapEncodedFields(candidate)).toEqual({candidate, changes: []});
});

it("leaves text that is JSON of the wrong shape alone", () => {
  const candidate = {...passingAppearance(), body: "5", palette: "[1,2]"};

  expect(unwrapEncodedFields(candidate)).toEqual({candidate, changes: []});
});

it("does not parse text over the size limit", () => {
  const candidate = {...passingAppearance(), body: `[${" ".repeat(16 * 1024 - 1)}]`};

  expect(unwrapEncodedFields(candidate)).toEqual({candidate, changes: []});
});

it("parses text exactly at the size limit", () => {
  const spaces = " ".repeat(16 * 1024 - 2);
  const result = unwrapEncodedFields({...passingAppearance(), projectile: `[${spaces}]`});

  expect(result.changes).toEqual(["projectile"]);
});

it("leaves a field that is meant to be text alone", () => {
  const candidate = passingAppearance();
  const result = unwrapEncodedFields(candidate);

  expect(result).toEqual({candidate, changes: []});
});

it("leaves a part that is not a record alone while it reads the points of the others", () => {
  const source = passingAppearance();
  const polygon = (source.body as Record<string, unknown>[])[2] ?? {};
  const candidate = {...source, body: [null, 5, "text", {...polygon, points: JSON.stringify(polygon.points)}]};
  const result = unwrapEncodedFields(candidate);

  expect(result.candidate).toEqual({...source, body: [null, 5, "text", polygon]});
  expect(result.changes).toEqual(["body.points"]);
});

it("passes through what is not an object", () => {
  expect(unwrapEncodedFields("a rifle")).toEqual({candidate: "a rifle", changes: []});
  expect(unwrapEncodedFields(undefined)).toEqual({candidate: undefined, changes: []});
});

it("does not change what it was given", () => {
  const source = passingAppearance();
  const encoded = {...source, body: JSON.stringify(source.body)};
  const before = JSON.stringify(encoded);

  unwrapEncodedFields(encoded);

  expect(JSON.stringify(encoded)).toBe(before);
});
