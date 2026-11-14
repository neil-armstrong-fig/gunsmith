import type {AssertionOptions} from "@gunsmith/audio-studies/browser/playwright/types/AssertionOptions";

/** What can be asserted about a thing on the page: that it comes to have an attribute with a value. */
export interface AttributeAssertion {
  toHaveAttribute: (name: string, value: string, options?: AssertionOptions) => Promise<void>;
}
