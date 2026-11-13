/**
 * Wraps a failure from the lower level with what the DSL was attempting, so a failed criterion reads as one sentence: what was
 * expected, then why it did not hold. The wrapped error stays as its `cause`, and its stack is carried along.
 */
export class DslError extends Error {
  constructor(message: string, previousError: unknown) {
    super(`${message}: ${DslError.describe(previousError)}`, {cause: previousError});
    this.name = "DslError";

    if (previousError instanceof Error) {
      this.stack += `\n\nCaused by: ${previousError.stack}`;
    }
  }

  private static describe(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
