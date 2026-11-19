import {PipelineTimedOut} from "@src/router/routes/shared/time-limit/PipelineTimedOut";

/**
 * `work`'s answer, or a rejection with `PipelineTimedOut` once `milliseconds` have gone by first. The loser is simply ignored: a
 * pipeline that answers (or fails) after the limit changes nothing, and the timer is cleared whichever side wins, so none is left
 * running. It stops the caller waiting, not the work itself.
 */
export async function withTimeLimit<Result>(work: Promise<Result>, milliseconds: number): Promise<Result> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeLimit = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new PipelineTimedOut());
    }, milliseconds);
  });

  try {
    return await Promise.race([work, timeLimit]);
  } finally {
    clearTimeout(timer);
  }
}
