import type {BaseCallbackHandler} from "@langchain/core/callbacks/base";

/** What the adapter needs to build a model: the key, handed in because a Worker's secrets are not `process.env`, and any callbacks every model carries. */
export interface AnthropicModelOptions {
  apiKey: string;
  /** Carried by every model built, such as the eval's spend guard. The Worker passes none. */
  callbacks?: BaseCallbackHandler[];
}
