import {Linter} from "eslint";
import globals from "globals";
import tseslint from "typescript-eslint";

/** What is wrong with a script file, as `line: message`, by the recommended rules and `object-shorthand`. */
export function standaloneScriptFailures(code: string, filename: string): string[] {
  const linter = new Linter();
  const messages = linter.verify(
    code,
    [
      ...tseslint.configs.recommended,
      {
        files: ["**/*.{js,mjs,ts,tsx}"],
        languageOptions: {globals: {...globals.browser, ...globals.node}},
        rules: {"object-shorthand": ["error", "properties"]},
      },
    ],
    {filename},
  );
  return messages.map(message => `${message.line}: ${message.message}`);
}
