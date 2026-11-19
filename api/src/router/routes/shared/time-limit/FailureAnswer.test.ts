import {failureAnswer} from "@src/router/routes/shared/time-limit/FailureAnswer";
import {PipelineTimedOut} from "@src/router/routes/shared/time-limit/PipelineTimedOut";

it("answers 504 generation-timed-out when the pipeline ran out of time", async () => {
  const response = failureAnswer(new PipelineTimedOut());

  expect(response.status).toBe(504);
  expect(await response.json()).toEqual({error: "generation-timed-out"});
});

it("answers 502 generation-failed for any other failure", async () => {
  for (const failure of [new Error("the model failed"), "a string", undefined]) {
    const response = failureAnswer(failure);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({error: "generation-failed"});
  }
});
