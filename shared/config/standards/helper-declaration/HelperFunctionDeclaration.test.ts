import {ESLint} from "eslint";
import {expect, it} from "vitest";

it.each([
  {
    name: "nested function helper",
    code: "function outer() { const helper = () => 1; return helper(); }",
    rejected: false,
  },
  {name: "test callback helper", code: "it('case', () => { const helper = () => 1; helper(); });", rejected: false},
  {
    name: "method helper",
    code: "class Subject { run() { const helper = function() { return 1; }; return helper(); } }",
    rejected: false,
  },
  {
    name: "arrow component handler",
    code: "const Button = () => { const click = () => dispatch(); return <button onClick={click}/>; };",
    rejected: false,
  },
  {name: "arrow helper", code: "const helper = () => 1; helper();", rejected: true},
  {name: "function expression", code: "const helper = function() { return 1; };", rejected: true},
  {name: "async generic", code: "const helper = async <T,>(value: T) => value;", rejected: true},
  {name: "declaration", code: "helper(); function helper() {}", rejected: false},
  {name: "inline callback", code: "items.map(item => item.id);", rejected: false},
  {name: "mutable function value", code: "let finish = () => {}; finish = resolve;", rejected: false},
  {name: "exported value", code: "export const value = () => 1;", rejected: false},
  {
    name: "helper inside exported function",
    code: "export function outer() { const helper = () => 1; return helper(); }",
    rejected: false,
  },
  {
    name: "component handler",
    code: "function Button() { const click = () => dispatch(); return <button onClick={click}/>; }",
    rejected: false,
  },
  {
    name: "plain component helper",
    code: "function Button() { const helper = () => 1; return <div>{helper()}</div>; }",
    rejected: false,
  },
  {name: "component value", code: "const Button = () => <button/>;", rejected: false},
])("checks $name", async ({code, rejected}) => {
  const eslint = new ESLint();
  const results = await eslint.lintText(code, {filePath: "src/Probe.tsx"});
  const messages = results.flatMap(result => result.messages);
  expect(messages.some(message => message.fatal)).toBe(false);
  expect(messages.some(message => message.ruleId === "gunsmith/helper-function-declaration")).toBe(rejected);
});
