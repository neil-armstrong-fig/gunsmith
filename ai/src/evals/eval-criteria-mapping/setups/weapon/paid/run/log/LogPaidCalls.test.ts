import {mkdtempSync, readFileSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {logPaidCalls} from "@evals/eval-criteria-mapping/setups/weapon/paid/run/log/LogPaidCalls";

it("writes one line holding the request, how long it took and what each call used", () => {
  const file = logFile();

  logPaidCalls({
    file,
    prompt: "a mild rifle",
    durationMs: 1234,
    statsCalls: 1,
    calls: [{inputTokens: 300, outputTokens: 40, stopReason: "tool_use"}],
  });

  expect(linesOf(file)).toEqual([
    {
      at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      prompt: "a mild rifle",
      durationMs: 1234,
      statsCalls: 1,
      calls: [{inputTokens: 300, outputTokens: 40, stopReason: "tool_use"}],
    },
  ]);
});

it("adds to what is there instead of replacing it, so one run's requests all stay", () => {
  const file = logFile();
  logPaidCalls({file, prompt: "first", durationMs: 1, statsCalls: 0, calls: []});
  logPaidCalls({file, prompt: "second", durationMs: 2, statsCalls: 0, calls: []});

  expect(linesOf(file)).toEqual([
    expect.objectContaining({prompt: "first"}),
    expect.objectContaining({prompt: "second"}),
  ]);
});

it("keeps a request whose prompt holds a newline on one line", () => {
  const file = logFile();
  logPaidCalls({file, prompt: "line one\nline two", durationMs: 1, statsCalls: 0, calls: []});

  expect(linesOf(file)).toEqual([expect.objectContaining({prompt: "line one\nline two"})]);
});

function linesOf(file: string): unknown[] {
  return readFileSync(file, "utf8")
    .trim()
    .split("\n")
    .map((line): unknown => JSON.parse(line));
}

function logFile(): string {
  return join(mkdtempSync(join(tmpdir(), "calls-")), "nested", "calls.jsonl");
}
