import {PipelineTimedOut} from "@src/router/routes/shared/time-limit/PipelineTimedOut";
import {withTimeLimit} from "@src/router/routes/shared/time-limit/WithTimeLimit";

afterEach(() => {
  vi.useRealTimers();
});

it("answers with the work's answer when it comes within the limit", async () => {
  await expect(withTimeLimit(() => Promise.resolve("a weapon"), 1000)).resolves.toBe("a weapon");
});

it("fails with the work's own failure when it fails within the limit", async () => {
  await expect(withTimeLimit(() => Promise.reject(new Error("the model failed")), 1000)).rejects.toThrow(
    "the model failed",
  );
});

it("fails with PipelineTimedOut once the limit has gone by", async () => {
  vi.useFakeTimers();
  const answer = withTimeLimit(() => new Promise<string>(() => undefined), 1000);
  const outcome = expect(answer).rejects.toBeInstanceOf(PipelineTimedOut);

  await vi.advanceTimersByTimeAsync(1000);

  await outcome;
});

it("is still waiting a millisecond before the limit", async () => {
  vi.useFakeTimers();
  let settled = false;
  const answer = withTimeLimit(() => new Promise<string>(() => undefined), 1000).catch(() => {
    settled = true;
  });

  await vi.advanceTimersByTimeAsync(999);

  expect(settled).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  await answer;
});

it("clears its timer when the work answers or fails first", async () => {
  vi.useFakeTimers();

  await withTimeLimit(() => Promise.resolve("a weapon"), 1000);
  await withTimeLimit(() => Promise.reject(new Error("the model failed")), 1000).catch(() => undefined);

  expect(vi.getTimerCount()).toBe(0);
});

it("does not fail a second time when the work fails after the limit", async () => {
  vi.useFakeTimers();
  let fail: (reason: Error) => void = () => undefined;
  const work = new Promise<string>((_resolve, reject) => {
    fail = reject;
  });
  const outcome = expect(withTimeLimit(() => work, 1000)).rejects.toBeInstanceOf(PipelineTimedOut);

  await vi.advanceTimersByTimeAsync(1000);
  await outcome;
  fail(new Error("the model failed late"));
  await vi.advanceTimersByTimeAsync(0);
});

it("hands the work a signal that is not aborted while it is within the limit", async () => {
  vi.useFakeTimers();
  const signals: AbortSignal[] = [];
  const answer = withTimeLimit(signal => {
    signals.push(signal);

    return new Promise<string>(() => undefined);
  }, 1000).catch(() => undefined);

  await vi.advanceTimersByTimeAsync(999);

  expect(signals).toHaveLength(1);
  expect(signals[0]?.aborted).toBe(false);

  await vi.advanceTimersByTimeAsync(1);
  await answer;
});

it("aborts that signal, with PipelineTimedOut as the reason, once the limit has gone by", async () => {
  vi.useFakeTimers();
  const signals: AbortSignal[] = [];
  const answer = withTimeLimit(signal => {
    signals.push(signal);

    return new Promise<string>(() => undefined);
  }, 1000).catch(() => undefined);

  await vi.advanceTimersByTimeAsync(1000);
  await answer;

  expect(signals[0]?.aborted).toBe(true);
  expect(signals[0]?.reason).toBeInstanceOf(PipelineTimedOut);
});

it("never aborts the signal of work that answered in time", async () => {
  vi.useFakeTimers();
  let signalOfWork: AbortSignal | undefined;

  await withTimeLimit(signal => {
    signalOfWork = signal;

    return Promise.resolve("a weapon");
  }, 1000);
  await vi.advanceTimersByTimeAsync(5000);

  expect(signalOfWork?.aborted).toBe(false);
});

it("still fails with PipelineTimedOut when the work, told to stop, rejects with its own cancellation", async () => {
  vi.useFakeTimers();
  const answer = withTimeLimit(
    signal =>
      new Promise<string>((_resolve, reject) => {
        signal.addEventListener("abort", () => {
          reject(new Error("the model call was cancelled"));
        });
      }),
    1000,
  );
  const outcome = expect(answer).rejects.toBeInstanceOf(PipelineTimedOut);

  await vi.advanceTimersByTimeAsync(1000);

  await outcome;
});
