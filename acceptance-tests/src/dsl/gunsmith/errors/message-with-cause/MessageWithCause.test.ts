import {expect, it} from "vitest";
import {messageWithCause} from "@src/dsl/gunsmith/errors/message-with-cause/MessageWithCause";

it("adds the first line of the cause to the message", () => {
  const timeout = new Error(
    "locator.pressSequentially: Timeout 5000ms exceeded.\nCall log:\n  - waiting for the textbox",
  );

  expect(messageWithCause("Failed to type the prompt", timeout)).toBe(
    "Failed to type the prompt: locator.pressSequentially: Timeout 5000ms exceeded.",
  );
});

it("leaves the message alone when the cause is not an error", () => {
  expect(messageWithCause("Failed to type the prompt", "a string")).toBe("Failed to type the prompt");
});
