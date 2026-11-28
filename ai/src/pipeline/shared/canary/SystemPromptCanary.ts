/**
 * A made-up token placed inside every system prompt. If it ever appears in what a player sees, the prompt leaked. It only has to
 * be unguessable and absent from any real output.
 *
 * TODO before the repository is open-sourced: this must become a secret, read from the environment (a Worker secret, populated
 * into `process.env` by `nodejs_compat_populate_process_env`) and passed in as a dependency, not imported. A canary that is
 * public in the source is known to every attacker, who can then ask the model to leave it out, so the leak check proves
 * nothing. The evals would use their own throwaway value. Tracked in `TODO-ai.md` and `MANUAL-SETUP-STEPS.md` step 15.
 */
export const SYSTEM_PROMPT_CANARY = "canary-gs-7f3a91c2";
