const ACCOUNT_ID = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * The account a request is for, read off the `X-Account-Id` header, or `undefined` when it has none or it is not an opaque token.
 * **A stand-in until sign-in exists:** it proves nobody, so it only names the `CreditLedger` to charge. When sessions land the id comes
 * from the session and this header goes.
 */
export function parseAccountId(header: string | undefined): string | undefined {
  if (header === undefined || !ACCOUNT_ID.test(header)) {
    return undefined;
  }

  return header;
}
