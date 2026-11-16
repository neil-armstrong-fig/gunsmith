import ts from "typescript";
import {expect, it} from "vitest";
import {anonymousObjectTypesOf} from "@gunsmith/shared/config/standards/named-types/anonymous/AnonymousObjectTypesOf.ts";

it.each([
  {name: "parameter", code: "function subject(value: {enabled: boolean}) {}", count: 1},
  {name: "promise return", code: "function subject(): Promise<{enabled: boolean}> {}", count: 1},
  {name: "interface field", code: "interface Subject { value: {enabled: boolean} }", count: 1},
  {name: "record value", code: "type Subject = Record<string, {enabled: boolean}>;", count: 1},
  {name: "named object definition", code: "type Subject = {enabled: boolean};", count: 0},
  {name: "component-local props", code: "interface Props {value: {enabled: boolean}}", count: 0},
  {name: "exported props", code: "export interface Props {value: {enabled: boolean}}", count: 1},
])("identifies $name", ({code, count}) => {
  const sourceFile = ts.createSourceFile("Subject.tsx", code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  expect(anonymousObjectTypesOf(sourceFile)).toHaveLength(count);
});
