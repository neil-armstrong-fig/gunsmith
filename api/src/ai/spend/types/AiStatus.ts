/** Whether AI generation is on. When it is off, `returnsAt` is when it comes back (milliseconds since 1970), for the banner. */
export interface AiStatus {
  on: boolean;
  returnsAt?: number;
}
