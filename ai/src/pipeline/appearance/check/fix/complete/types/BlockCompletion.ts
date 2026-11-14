/** One block of an appearance (the palette, the impact) after completion, and a label for each field or the whole block filled. */
export interface BlockCompletion {
  block: unknown;
  changes: string[];
}
