import {ESLint} from "eslint";
import {expect, it} from "vitest";

it.each([
  {name: "later declaration", code: 'it("x", () => helper()); function helper() {}', rejected: false},
  {name: "early declaration", code: 'function helper() {} it("x", () => helper());', rejected: true},
  {
    name: "last caller",
    code: "function first() { helper(); } function helper() {} function last() { helper(); }",
    rejected: true,
  },
  {name: "callback reference", code: "function helper() {} values.map(helper);", rejected: true},
  {name: "nested correct", code: "function outer() { helper(); function helper() {} }", rejected: false},
  {name: "nested reversed", code: "function outer() { function helper() {} helper(); }", rejected: true},
  {name: "self recursion", code: "function helper() { return helper(); }", rejected: false},
  {name: "type reference", code: "function helper() {} type Result = ReturnType<typeof helper>;", rejected: false},
  {name: "named export", code: "function helper() {} export {helper};", rejected: false},
  {
    name: "shadowed parameter",
    code: "function helper() {} function caller(helper: () => void) { helper(); }",
    rejected: false,
  },
  {
    name: "async generic",
    code: "function helper<T>(x: T) { return x; } async function caller() { return helper(1); }",
    rejected: true,
  },
  {
    name: "component",
    code: "function Child() { return <div/>; } function Parent() { return <Child/>; }",
    rejected: false,
  },
  {
    name: "plain helper in TSX",
    code: "function helper() { return 1; } function Parent() { return <div>{helper()}</div>; }",
    rejected: true,
  },
])("checks $name", async ({code, rejected}) => {
  const eslint = new ESLint();
  const results = await eslint.lintText(code, {filePath: "src/Probe.tsx"});
  const messages = results.flatMap(result => result.messages);

  expect(messages.some(message => message.fatal)).toBe(false);
  expect(messages.some(message => message.ruleId === "gunsmith/function-order")).toBe(rejected);
});
