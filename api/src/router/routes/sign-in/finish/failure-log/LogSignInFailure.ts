import type {SignInFailure} from "@src/router/routes/sign-in/finish/types/SignInFailure";

/**
 * Says that a sign-in ended signed out: the route, the outcome and the error's class, and nothing else. **Never** a code, state,
 * subject, address or cookie (`docs/privacy-and-data.md`): a log is read by people who must not be able to sign in as a player.
 */
export function logSignInFailure(outcome: SignInFailure, error?: unknown): void {
  console.warn(
    JSON.stringify({route: "auth/google/callback", outcome, error: error instanceof Error ? error.name : undefined}),
  );
}
