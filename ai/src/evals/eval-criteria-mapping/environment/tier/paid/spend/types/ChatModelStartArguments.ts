import type {BaseCallbackHandler} from "@langchain/core/callbacks/base";

/** What LangChain tells a callback handler when a chat call starts: the model, the messages, the run's ids, tags and metadata. */
export type ChatModelStartArguments = Parameters<NonNullable<BaseCallbackHandler["handleChatModelStart"]>>;
