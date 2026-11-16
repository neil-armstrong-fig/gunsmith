import {expect, it} from "vitest";
import {executableScriptsOf} from "@gunsmith/shared/config/repository/artifacts/file/html/executable/ExecutableScriptsOf.ts";

it.each([
  {name: "unquoted data type", html: '<script type=application/json>{"key":1}</script>', scripts: []},
  {name: "HTML comment", html: "<!-- <script>invalid = ;</script> -->", scripts: []},
  {
    name: "quoted angle bracket",
    html: '<script data-note=">">const value = 1;</script>',
    scripts: [{code: "const value = 1;", scriptMode: "script"}],
  },
  {
    name: "module",
    html: "<script type=module>await Promise.resolve();</script>",
    scripts: [{code: "await Promise.resolve();", scriptMode: "module"}],
  },
])("reads $name", ({html, scripts}) => {
  expect(executableScriptsOf(html)).toEqual(scripts);
});
