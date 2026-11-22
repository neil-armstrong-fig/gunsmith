import {messageWithCause} from "@src/dsl/gunsmith/errors/message-with-cause/MessageWithCause";

/** Wraps a failure with the DSL-level intent, so a test failure says what was being attempted and why it failed. */
export class DslError extends Error {
  constructor(message: string, previousError: unknown) {
    super(messageWithCause(message, previousError));
    this.name = "DslError";

    if (previousError instanceof Error) {
      this.stack += `\n\nCaused by: ${previousError.stack}`;
    }
  }
}
