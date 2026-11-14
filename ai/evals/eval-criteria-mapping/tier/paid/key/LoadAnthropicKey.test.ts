import {mkdtempSync, writeFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {loadAnthropicKey} from "@evals/eval-criteria-mapping/tier/paid/key/LoadAnthropicKey";

const DUMMY_KEY = "dummy-key-for-a-test";
const keyInTheShell = process.env.ANTHROPIC_API_KEY;

// `process.loadEnvFile` never overrides a variable that is already set, so a key exported in the shell would make "loads it from
// the file" pass without testing the file. Every test starts without one, and the shell's own is put back afterwards.
beforeEach(() => {
  delete process.env.ANTHROPIC_API_KEY;
});

afterEach(() => {
  if (keyInTheShell === undefined) {
    delete process.env.ANTHROPIC_API_KEY;
  } else {
    process.env.ANTHROPIC_API_KEY = keyInTheShell;
  }
});

function fileWith(text: string): string {
  const file = join(mkdtempSync(join(tmpdir(), "key-")), ".env.local");
  writeFileSync(file, text);

  return file;
}

it("leaves a key that is already in the environment alone, and needs no file", () => {
  process.env.ANTHROPIC_API_KEY = DUMMY_KEY;

  loadAnthropicKey(join(tmpdir(), "no-such-folder", ".env.local"));

  expect(process.env.ANTHROPIC_API_KEY).toBe(DUMMY_KEY);
});

it("loads the key from the file when the environment has none", () => {
  loadAnthropicKey(fileWith(`ANTHROPIC_API_KEY=${DUMMY_KEY}\n`));

  expect(process.env.ANTHROPIC_API_KEY).toBe(DUMMY_KEY);
});

it("says which file it could not find when there is no key and no file", () => {
  const missing = join(tmpdir(), "no-such-folder", ".env.local");

  expect(() => loadAnthropicKey(missing)).toThrow(`No ANTHROPIC_API_KEY set, and no ${missing}`);
});

it("says the file has no key line when it loads but holds no key", () => {
  const file = fileWith("SOMETHING_ELSE=1\n");

  expect(() => loadAnthropicKey(file)).toThrow(`${file} has no ANTHROPIC_API_KEY line`);
});

it("never puts what the file held in an error message", () => {
  const file = fileWith(`OTHER_KEY=${DUMMY_KEY}\n`);

  expect(() => loadAnthropicKey(file)).toThrow(
    expect.objectContaining({message: expect.not.stringContaining(DUMMY_KEY)}),
  );
});
