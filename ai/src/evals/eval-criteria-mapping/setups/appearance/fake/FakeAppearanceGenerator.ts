import type {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {passingAppearance} from "@gunsmith/ai/pipeline/appearance/testing/PassingAppearance";
import {ToolCallingFakeModel} from "@gunsmith/ai/pipeline/appearance/testing/ToolCallingFakeModel";

/** A model that draws the same valid drawing every time. The appearance's fake tier, and the weapon's canned drawer on its fake and local tiers. */
export function fakeAppearanceGenerator(): BaseChatModel {
  return new ToolCallingFakeModel({answers: [passingAppearance()]});
}
