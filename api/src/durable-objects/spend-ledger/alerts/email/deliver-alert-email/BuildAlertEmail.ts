import type {AlertEmail} from "@src/durable-objects/spend-ledger/types/AlertEmail";

const LINE_ENDING = "\r\n";
const BODY_LINE_LENGTH = 76;
const MICRODOLLARS_PER_DOLLAR = 1_000_000;
const FULL_BUDGET_PERCENT = 100;

/**
 * An RFC 5322 message for one spend alert, written the way the personal site's contact Worker writes its mail: base64 body and subject
 * so no value can add a header, and the two addresses (from the Worker's own configuration) refused if they are not on one line.
 */
export function buildAlertEmail(alert: AlertEmail): string {
  const {percent, fromAddress, toAddress, messageId, date} = alert;
  refuseUnlessPlainAddress(fromAddress);
  refuseUnlessPlainAddress(toAddress);

  const fromDomain = fromAddress.slice(fromAddress.indexOf("@") + 1);
  const headers = [
    `From: Gunsmith alerts <${fromAddress}>`,
    `To: ${toAddress}`,
    `Subject: ${encodedWord(`Gunsmith AI spend at ${percent}% of the monthly budget`)}`,
    `Date: ${date.toUTCString()}`,
    `Message-ID: <${messageId}@${fromDomain}>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
  ];

  return headers.join(LINE_ENDING) + LINE_ENDING + LINE_ENDING + wrapBase64(base64(bodyOf(alert)));
}

function bodyOf({percent, spentMicrodollars, capMicrodollars}: AlertEmail): string {
  const spent = `Spent this month: ${dollars(spentMicrodollars)} of ${dollars(capMicrodollars)}.`;

  // At the cap the spend can read a little short of it: the request that would have crossed it was refused, not reserved.
  if (percent >= FULL_BUDGET_PERCENT) {
    return [
      "Gunsmith's AI spend has used the monthly budget.",
      "",
      spent,
      "",
      "AI generation is off until the month resets; built-in play continues.",
    ].join(LINE_ENDING);
  }

  return [`Gunsmith's AI spend has reached ${percent}% of the monthly budget.`, "", spent].join(LINE_ENDING);
}

function dollars(microdollars: number): string {
  return `$${(microdollars / MICRODOLLARS_PER_DOLLAR).toFixed(2)}`;
}

function refuseUnlessPlainAddress(address: string): void {
  if (/[\r\n<>,;\s]/.test(address)) {
    throw new Error("Alert address is not a plain address");
  }
}

// RFC 2047 encoded word, as the personal site's contact Worker writes its headers.
function encodedWord(text: string): string {
  return `=?UTF-8?B?${base64(text)}?=`;
}

function base64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary);
}

function wrapBase64(encoded: string): string {
  const lines: string[] = [];

  for (let start = 0; start < encoded.length; start += BODY_LINE_LENGTH) {
    lines.push(encoded.slice(start, start + BODY_LINE_LENGTH));
  }

  return lines.join(LINE_ENDING);
}
