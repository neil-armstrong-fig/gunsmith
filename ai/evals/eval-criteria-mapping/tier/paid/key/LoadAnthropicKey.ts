/**
 * Makes sure `ANTHROPIC_API_KEY` is set for a paid model: it is left alone when the environment has it, and otherwise loaded from
 * the git-ignored `keyFile` (`ai/.env.local`). The key is never printed, and no error here carries what the file held.
 */
export function loadAnthropicKey(keyFile: string): void {
  if (process.env.ANTHROPIC_API_KEY !== undefined) {
    return;
  }

  try {
    process.loadEnvFile(keyFile);
  } catch {
    throw new Error(`No ANTHROPIC_API_KEY set, and no ${keyFile} to load it from (MANUAL-SETUP-STEPS.md step 8).`);
  }

  if (process.env.ANTHROPIC_API_KEY === undefined) {
    throw new Error(`${keyFile} has no ANTHROPIC_API_KEY line.`);
  }
}
