import {expect, it} from "vitest";
import {standaloneScriptFailures} from "@gunsmith/shared/config/repository/artifacts/file/standalone/StandaloneScriptFailures.ts";

it("accepts typed component props and JSX in a TSX artifact", () => {
  const code =
    "interface Props {title: string} export function Subject(props: Props): unknown { return <span>{props.title}</span>; }";
  expect(standaloneScriptFailures(code, "Subject.tsx")).toEqual([]);
});

it("rejects unnecessary property repetition", () => {
  expect(
    standaloneScriptFailures("const value = 1; export const result = {value: value};", "Subject.ts").join("\n"),
  ).toContain("shorthand");
});
