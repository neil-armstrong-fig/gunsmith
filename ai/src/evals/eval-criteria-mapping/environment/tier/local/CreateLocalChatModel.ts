import {ChatOllama} from "@langchain/ollama";
import type {LocalModelOptions} from "@evals/eval-criteria-mapping/environment/tier/local/types/LocalModelOptions";

const LOCAL_BASE_URL = "http://127.0.0.1:11434";
const LOCAL_MODEL = "qwen3.5:9b";

/**
 * A model on the local Ollama with thinking off, as every local tier has it; `EVAL_LOCAL_MODEL` names another. Only `ai/src/evals`
 * may import `@langchain/ollama`: the rest of `src/` is what the Worker bundles. The temperature and the length are each domain's own.
 */
export function createLocalChatModel(options: LocalModelOptions): ChatOllama {
  return new ChatOllama({
    baseUrl: LOCAL_BASE_URL,
    model: process.env.EVAL_LOCAL_MODEL ?? LOCAL_MODEL,
    think: false,
    ...options,
  });
}
