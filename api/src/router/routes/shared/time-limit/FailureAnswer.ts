import {PipelineTimedOut} from "@src/router/routes/shared/time-limit/PipelineTimedOut";

/** The answer for a pipeline that did not give an outcome: 504 `generation-timed-out` when it ran out of time, 502 `generation-failed` otherwise. */
export function failureAnswer(error: unknown): Response {
  if (error instanceof PipelineTimedOut) {
    return Response.json({error: "generation-timed-out"}, {status: 504});
  }

  return Response.json({error: "generation-failed"}, {status: 502});
}
