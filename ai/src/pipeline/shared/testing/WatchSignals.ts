import type {BaseChatModel} from "@langchain/core/language_models/chat_models";

/**
 * Starts keeping the abort signal each call to the model is given, and runs `whileAnswering` inside every call, so a test can
 * cancel a request in the middle of a stage and see whether the next stage ever starts and whether the signal reached the call.
 * The model still answers as it did. Returns the list the signals are added to, one per call. Test-only.
 */
export function watchSignals(
  model: BaseChatModel,
  whileAnswering: () => void = () => undefined,
): (AbortSignal | undefined)[] {
  const signals: (AbortSignal | undefined)[] = [];
  const answer = model._generate.bind(model);

  vi.spyOn(model, "_generate").mockImplementation((messages, options, runManager) => {
    signals.push(options.signal);
    whileAnswering();

    return answer(messages, options, runManager);
  });

  return signals;
}
