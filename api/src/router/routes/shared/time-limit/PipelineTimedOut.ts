/** What `withTimeLimit` rejects with when the pipeline has not answered in time: a route tells it from the pipeline's own failure. */
export class PipelineTimedOut extends Error {
  constructor() {
    super("the pipeline did not answer in time");
  }
}
