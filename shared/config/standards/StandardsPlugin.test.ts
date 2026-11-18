import {ESLint} from "eslint";
import {resolve} from "node:path";
import {expect, it} from "vitest";

it.each([
  [
    "return ternaries",
    "export function probe(flag: boolean): number { return flag ? 1 : 2; }",
    "gunsmith/no-return-ternary",
  ],
  [
    "four parameters",
    "export function probe(a: number, b: number, c: number, d: number): number { return a+b+c+d; }",
    "max-params",
  ],
  [
    "anonymous parameter types",
    "export function probe(value: {enabled: boolean}): boolean { return value.enabled; }",
    "gunsmith/named-object-types",
  ],
  ["multiple exports", "export const first = 1; export const second = 2;", "gunsmith/single-export"],
])("rejects %s through the real package config", async (_name, code, ruleId) => {
  const eslint = new ESLint({cwd: resolve(import.meta.dirname, "../..")});
  const results = await eslint.lintText(code, {filePath: "src/Probe.ts"});
  expect(results.flatMap(result => result.messages.map(message => message.ruleId))).toContain(ruleId);
});

it.each([
  [
    "named types",
    "interface Options {enabled: boolean} export function probe(value: Options): boolean { return value.enabled; }",
    "src/Probe.ts",
  ],
  [
    "schema companions",
    "export const choices = ['one'] as const; export type Choice = (typeof choices)[number];",
    "src/Choice.ts",
  ],
  [
    "class options",
    "export interface Options {enabled: boolean} export class Probe { constructor(value: Options) { console.warn(value); } }",
    "src/Probe.ts",
  ],
  [
    "component props",
    "interface Props {value: {enabled: boolean}} export function Probe(props: Props) { return <div>{String(props.value.enabled)}</div>; }",
    "src/Probe.tsx",
  ],
])("preserves %s", async (_name, code, filePath) => {
  const eslint = new ESLint({cwd: resolve(import.meta.dirname, "../..")});
  const results = await eslint.lintText(code, {filePath});
  expect(results.flatMap(result => result.messages.filter(message => message.ruleId?.startsWith("gunsmith/")))).toEqual(
    [],
  );
});

it.each(["ai", "acceptance-tests"])("keeps standards enabled beneath %s syntax overrides", async packageName => {
  const eslint = new ESLint({cwd: resolve(import.meta.dirname, "../../..", packageName)});
  let filePath = "src/dsl/probe/ProbeDsl.ts";
  if (packageName === "ai") {
    filePath = "src/evals/dsl/probe/ProbeDsl.ts";
  }
  const results = await eslint.lintText("export function probe(flag: boolean): number { return flag ? 1 : 2; }", {
    filePath,
  });
  expect(results.flatMap(result => result.messages.map(message => message.ruleId))).toContain(
    "gunsmith/no-return-ternary",
  );
});

it("rejects multiple exports in one declaration", async () => {
  const eslint = new ESLint({cwd: resolve(import.meta.dirname, "../..")});
  const results = await eslint.lintText("export const first = 1, second = 2;", {filePath: "src/Probe.ts"});
  expect(results.flatMap(result => result.messages.map(message => message.ruleId))).toContain("gunsmith/single-export");
});

it.each([
  "import {value} from 'example';\n\nimport {other} from 'other';\n\nexport const result = value + other;",
  "import {value} from 'example';\nexport const result = value;",
])("requires a contiguous import block separated from code", async code => {
  const eslint = new ESLint({cwd: resolve(import.meta.dirname, "../..")});
  const results = await eslint.lintText(code, {filePath: "src/Probe.ts"});
  expect(results.flatMap(result => result.messages.map(message => message.ruleId))).toContain(
    "gunsmith/import-spacing",
  );
});

it("does not treat a comment as a runtime-derived type", async () => {
  const eslint = new ESLint({cwd: resolve(import.meta.dirname, "../..")});
  const code = "export const choices = ['one'] as const; export type Unrelated = string; // typeof choices";
  const results = await eslint.lintText(code, {filePath: "src/Probe.ts"});
  expect(results.flatMap(result => result.messages.map(message => message.ruleId))).toContain("gunsmith/single-export");
});

it("does not exempt exported Props interfaces", async () => {
  const eslint = new ESLint({cwd: resolve(import.meta.dirname, "../..")});
  const results = await eslint.lintText("export interface Props { value: {enabled: boolean} }", {
    filePath: "src/Probe.tsx",
  });
  expect(results.flatMap(result => result.messages.map(message => message.ruleId))).toContain(
    "gunsmith/named-object-types",
  );
});

it("does not treat a comment as a class interface dependency", async () => {
  const eslint = new ESLint({cwd: resolve(import.meta.dirname, "../..")});
  const results = await eslint.lintText(
    "export interface Options {enabled: boolean} export class Probe { /* Options */ }",
    {filePath: "src/Probe.ts"},
  );
  expect(results.flatMap(result => result.messages.map(message => message.ruleId))).toContain("gunsmith/single-export");
});

it.each(["shared", "engine", "ai", "api", "webapp", "acceptance-tests"])(
  "enforces function standards in %s tests",
  async packageName => {
    const eslint = new ESLint({cwd: resolve(import.meta.dirname, "../../..", packageName)});
    const results = await eslint.lintText(
      "function helper(): number { return 1; } const arrow = (): number => 2; it('case', () => { helper(); arrow(); });",
      {filePath: "src/Probe.test.ts"},
    );
    const rules = results.flatMap(result => result.messages.map(message => message.ruleId));
    expect(rules).toContain("gunsmith/function-order");
    expect(rules).toContain("gunsmith/helper-function-declaration");
  },
);

it("enforces function standards in root configuration tests", async () => {
  const eslint = new ESLint({cwd: resolve(import.meta.dirname, "../..")});
  const results = await eslint.lintText("function helper() {} it('case', () => helper());", {
    filePath: "probe.config.test.ts",
  });
  expect(results.flatMap(result => result.messages.map(message => message.ruleId))).toContain(
    "gunsmith/function-order",
  );
});
