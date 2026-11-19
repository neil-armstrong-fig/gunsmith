import {sendDueAlerts} from "@src/durable-objects/spend-ledger/alerts/SendDueAlerts";
import type {SendDueAlertsRequest} from "@src/durable-objects/spend-ledger/types/SendDueAlertsRequest";

it("sends each due alert lowest first and marks each sent", async () => {
  const log: string[] = [];

  await sendDueAlerts(requestLogging(log, {percents: [50, 80]}));

  expect(log).toEqual(["send 50", "marked 50", "send 80", "marked 80"]);
});

it("marks an alert only after its delivery has finished", async () => {
  const log: string[] = [];

  const sending = sendDueAlerts(requestLogging(log, {percents: [50], sendTakes: 10}));
  await Promise.resolve();
  expect(log).toEqual(["send 50"]);

  await sending;
  expect(log).toEqual(["send 50", "marked 50"]);
});

it("marks nothing for a failed delivery or any alert after it, and fails so it is tried again", async () => {
  const log: string[] = [];

  const sending = sendDueAlerts(requestLogging(log, {percents: [50, 80, 100], failingAt: 80}));

  await expect(sending).rejects.toThrow("delivery refused");
  expect(log).toEqual(["send 50", "marked 50", "send 80"]);
});

it("does nothing when no alert is due", async () => {
  const log: string[] = [];

  await sendDueAlerts(requestLogging(log, {percents: []}));

  expect(log).toEqual([]);
});

interface Scenario {
  percents: number[];
  failingAt?: number;
  sendTakes?: number;
}

function requestLogging(log: string[], scenario: Scenario): SendDueAlertsRequest {
  return {
    percents: scenario.percents,
    send: async percent => {
      log.push(`send ${percent}`);
      for (let turn = 0; turn < (scenario.sendTakes ?? 0); turn++) {
        await Promise.resolve();
      }
      if (percent === scenario.failingAt) {
        throw new Error("delivery refused");
      }
    },
    markSent: percent => {
      log.push(`marked ${percent}`);
    },
  };
}
