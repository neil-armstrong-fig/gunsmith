import {buildAlertEmail} from "@src/durable-objects/spend-ledger/alerts/email/deliver-alert-email/BuildAlertEmail";
import type {AlertEmail} from "@src/durable-objects/spend-ledger/types/AlertEmail";

const ALERT: AlertEmail = {
  percent: 80,
  spentMicrodollars: 16_200_000,
  capMicrodollars: 20_000_000,
  fromAddress: "alerts@example.test",
  toAddress: "owner@example.test",
  messageId: "message-1",
  date: new Date(Date.UTC(2026, 10, 18, 9, 30)),
};

it("addresses the email from the alerts address to the owner, with a message id on the sender's domain", () => {
  const headers = headersOf(buildAlertEmail(ALERT));

  expect(headers.get("From")).toBe("Gunsmith alerts <alerts@example.test>");
  expect(headers.get("To")).toBe("owner@example.test");
  expect(headers.get("Message-ID")).toBe("<message-1@example.test>");
  expect(headers.get("Date")).toBe("Wed, 18 Nov 2026 09:30:00 GMT");
  expect(headers.get("MIME-Version")).toBe("1.0");
});

it("names the share of the monthly budget in the subject", () => {
  const headers = headersOf(buildAlertEmail(ALERT));

  expect(decodedWord(headers.get("Subject"))).toBe("Gunsmith AI spend at 80% of the monthly budget");
});

it("states what has been spent and the cap in dollars", () => {
  const body = bodyOf(buildAlertEmail(ALERT));

  expect(body).toContain("Spent this month: $16.20 of $20.00.");
});

it("says AI is off until the month resets and built-in play continues, at 100 percent only", () => {
  const full = bodyOf(buildAlertEmail({...ALERT, percent: 100, spentMicrodollars: 19_400_000}));

  expect(full).toContain("Spent this month: $19.40 of $20.00.");
  expect(full).toContain("AI generation is off until the month resets; built-in play continues.");
  expect(full).not.toContain("has reached 100%");
  expect(bodyOf(buildAlertEmail(ALERT))).not.toContain("AI generation is off");
});

it("keeps every line of the encoded body within 76 characters", () => {
  const encodedBody = buildAlertEmail(ALERT).split("\r\n\r\n")[1] ?? "";

  expect(encodedBody.split("\r\n").length).toBeGreaterThan(1);
  expect(encodedBody.split("\r\n").every(line => line.length <= 76)).toBe(true);
});

it("refuses an address that could add a header", () => {
  expect(() => buildAlertEmail({...ALERT, toAddress: "owner@example.test\r\nBcc: other@example.test"})).toThrow(
    "not a plain address",
  );
  expect(() => buildAlertEmail({...ALERT, fromAddress: "alerts@example.test\nBcc: x@example.test"})).toThrow(
    "not a plain address",
  );
});

function headersOf(raw: string): Map<string, string> {
  const headerBlock = raw.split("\r\n\r\n")[0] ?? "";
  const headers = new Map<string, string>();

  for (const line of headerBlock.split("\r\n")) {
    const colon = line.indexOf(": ");
    headers.set(line.slice(0, colon), line.slice(colon + 2));
  }

  return headers;
}

function bodyOf(raw: string): string {
  const encoded = (raw.split("\r\n\r\n")[1] ?? "").replaceAll("\r\n", "");

  return Buffer.from(encoded, "base64").toString("utf8");
}

function decodedWord(word: string | undefined): string {
  const match = /^=\?UTF-8\?B\?(.*)\?=$/.exec(word ?? "");

  return Buffer.from(match?.[1] ?? "", "base64").toString("utf8");
}
