import {PipelineTimedOut} from "@src/router/routes/shared/time-limit/PipelineTimedOut";

/**
 * What `work` answers, or a rejection with `PipelineTimedOut` once `milliseconds` have gone by first. `work` is handed a signal that
 * is aborted, with the `PipelineTimedOut` as its reason, at that moment, so work that honours it (the AI pipeline does) stops its model
 * call instead of running on unpaid-for. The loser is otherwise ignored: work that answers (or fails) after the limit changes nothing,
 * and the timer is cleared whichever side wins, so none is left running.
 */
export async function withTimeLimit<Result>(
  work: (signal: AbortSignal) => Promise<Result>,
  milliseconds: number,
): Promise<Result> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeLimit = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      const timedOut = new PipelineTimedOut();
      reject(timedOut);
      controller.abort(timedOut);
    }, milliseconds);
  });

  try {
    return await Promise.race([work(controller.signal), timeLimit]);
  } finally {
    clearTimeout(timer);
  }
}
