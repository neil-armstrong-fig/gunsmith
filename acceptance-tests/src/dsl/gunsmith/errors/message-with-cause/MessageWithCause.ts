/** The cause goes in the message, since a report shows the message and cuts the stack down to its frames: a timeout inside a step otherwise reads only "Failed to ...". */
export function messageWithCause(message: string, previousError: unknown): string {
  if (!(previousError instanceof Error)) {
    return message;
  }

  const firstLine = previousError.message.split("\n")[0];

  return `${message}: ${firstLine}`;
}
