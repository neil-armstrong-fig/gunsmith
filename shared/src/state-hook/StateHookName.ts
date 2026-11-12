/**
 * The name of the one function the game puts on `window` so an acceptance spec can read its state: the canvas is not in
 * the DOM as anything a test can find. Read-only, and named here because the webapp installs it and the specs call it.
 */
export const STATE_HOOK_NAME = "gunsmithState";
