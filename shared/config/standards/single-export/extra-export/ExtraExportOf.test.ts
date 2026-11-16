import ts from "typescript";
import {expect, it} from "vitest";
import {extraExportOf} from "@gunsmith/shared/config/standards/single-export/extra-export/ExtraExportOf.ts";

it.each([
  {name: "wildcard re-export", code: "export * from 'source';", extra: "export * from 'source';"},
  {
    name: "value name is not a type dependency",
    code: "export interface Options {} export class Subject { Options() {} }",
    extra: "export class Subject { Options() {} }",
  },
  {name: "one subject", code: "export const value = 1;", extra: undefined},
  {
    name: "derived type",
    code: "export const values = ['one'] as const; export type Value = (typeof values)[number];",
    extra: undefined,
  },
  {
    name: "class parameter interface",
    code: "export interface Options {} export class Subject { constructor(options: Options) {} }",
    extra: undefined,
  },
  {
    name: "unrelated type",
    code: "export const value = 1; export type Other = string;",
    extra: "export type Other = string;",
  },
  {
    name: "comment-only dependency",
    code: "export interface Options {} export class Subject { /* Options */ }",
    extra: "export class Subject { /* Options */ }",
  },
  {name: "bundled variables", code: "export const one = 1, two = 2;", extra: "export const one = 1, two = 2;"},
  {name: "bundled re-exports", code: "export {one, two} from 'source';", extra: "export {one, two} from 'source';"},
])("checks $name", ({code, extra}) => {
  const sourceFile = ts.createSourceFile("Subject.ts", code, ts.ScriptTarget.Latest, true);
  expect(extraExportOf(sourceFile)?.getText(sourceFile)).toBe(extra);
});
