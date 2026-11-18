import {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {AIMessageChunk} from "@langchain/core/messages";
import type {BaseMessage} from "@langchain/core/messages";
import type {ChatResult} from "@langchain/core/outputs";
import {FAKE_ARENA_REPLY} from "@evals/eval-criteria-mapping/setups/arena/fake/models/reply/FakeArenaReply";

// The one request the arena specs expect the fake model to get wrong (`AskingForAnArena`, "a layout the game cannot play"), word for
// word. A fixture, not a model of failure: it stands in for a real model drawing a floor cut in two, so the specs can prove the
// pipeline never gives such an arena to a player, and falls back when the repair fails too. Whether a real model fails here is for
// the local and paid tiers.
const UNPLAYABLE_REQUEST = "an arena cut in two by a wall nobody can cross";

const UNPLAYABLE_REPLY = {
  name: "Cut In Two",
  rows: [
    "####################",
    "#........#.........#",
    "#........#.........#",
    "#........#.........#",
    "####################",
  ],
};

const REQUEST_BLOCK = /^<request>\n([\s\S]*)\n<\/request>$/;

/**
 * The fake tier's arena generator: a chat model that answers the generation function call like a real one. It draws a valid arena for
 * every request but the one above, and draws the same unplayable arena for that one on every try, repair included. Test-only.
 */
export class ArenaGenerationFakeModel extends BaseChatModel {
  constructor() {
    super({});
  }

  _llmType(): string {
    return "arena-generation-fake";
  }

  override bindTools(): this {
    return this;
  }

  async _generate(messages: BaseMessage[]): Promise<ChatResult> {
    const message = new AIMessageChunk({
      content: "",
      tool_calls: [{name: "extract", args: this.replyFor(messages), id: "call-generation", type: "tool_call"}],
    });

    return {generations: [{text: "", message}]};
  }

  // The request is in whichever message carries it: the second after the instructions, and the repair call keeps it there.
  private replyFor(messages: BaseMessage[]): typeof FAKE_ARENA_REPLY {
    const requests = messages.map(message => message.text.match(REQUEST_BLOCK)?.[1]);
    if (requests.includes(UNPLAYABLE_REQUEST)) {
      return UNPLAYABLE_REPLY;
    }

    return FAKE_ARENA_REPLY;
  }
}
