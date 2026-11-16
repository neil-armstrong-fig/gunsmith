import ts from "typescript";
import {expect, it} from "vitest";
import {importGapsOf} from "@gunsmith/shared/config/standards/import-spacing/gaps/ImportGapsOf.ts";

it.each([
  {
    name: "valid layout",
    code: "import {one} from 'one';\nimport {two} from 'two';\n\nconst value = one + two;",
    replacements: [],
  },
  {
    name: "blank line between imports",
    code: "import {one} from 'one';\n\nimport {two} from 'two';",
    replacements: ["\n"],
  },
  {name: "code touching imports", code: "import {one} from 'one';\nconst value = one;", replacements: ["\n\n"]},
  {
    name: "comment requiring manual spacing",
    code: "import {one} from 'one';\n// retain this comment\nconst value = one;",
    replacements: [undefined],
  },
  {
    name: "code between two imports",
    code: "import {one} from 'one';\nconst value = one;\nimport {two} from 'two';\n\nvalue + two;",
    replacements: [undefined],
  },
  {name: "a file that is only imports", code: "import {one} from 'one';\nimport {two} from 'two';", replacements: []},
  {name: "a file with no imports", code: "const value = 1;", replacements: []},
])("checks $name", ({code, replacements}) => {
  const sourceFile = ts.createSourceFile("Subject.ts", code, ts.ScriptTarget.Latest, true);
  expect(importGapsOf(sourceFile).map(importGap => importGap.replacement)).toEqual(replacements);
});
