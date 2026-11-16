import {Linter} from "eslint";
import {executableScriptsOf} from "@gunsmith/shared/config/repository/artifacts/file/html/executable/ExecutableScriptsOf.ts";

/** What is wrong with the scripts in an HTML page, each told by its number in the page. */
export function htmlScriptFailures(html: string): string[] {
  const linter = new Linter();
  return executableScriptsOf(html).flatMap((executableScript, index) => {
    const messages = linter.verify(executableScript.code, {
      languageOptions: {ecmaVersion: "latest", sourceType: executableScript.scriptMode},
    });
    return messages.map(message => `script ${index + 1}: ${message.message}`);
  });
}
