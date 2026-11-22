import {BaseChatModel} from "@langchain/core/language_models/chat_models";
import {AIMessageChunk} from "@langchain/core/messages";
import type {BaseMessage} from "@langchain/core/messages";
import type {ChatResult} from "@langchain/core/outputs";
import {FAKE_ARENA_REPLY} from "@evals/eval-criteria-mapping/setups/arena/fake/models/reply/FakeArenaReply";

// The one request the arena specs expect the fake model to get wrong in a way code can mend (`AskingForAnArena`, "cut in two"), word for
// word. A fixture, not a model of failure: it stands in for a real model drawing a floor cut in two, which code's repair mends by opening a
// door, so the specs prove a mended drawing is given to the player without a second model call. Whether a real model fails here is for
// the local and paid tiers.
const CUT_IN_TWO_REQUEST = "an arena cut in two by a wall nobody can cross";

const CUT_IN_TWO_REPLY = {
  name: "Cut In Two",
  rows: [
    "####################",
    "#........#.........#",
    "#........#.........#",
    "#........#.........#",
    "####################",
  ],
};

// The one request the arena specs expect the fake model to get wrong in a way code cannot mend (`AskingForAnArena`, "almost nothing but
// solid wall"), word for word, on every try, repair included: there is no floor to join and none to make, so the pipeline must fall back
// to a built-in arena. This is what keeps that path covered.
const UNREPAIRABLE_REQUEST = "an arena that is almost nothing but solid wall";

const UNREPAIRABLE_REPLY = {
  name: "Solid Block",
  rows: [
    "####################",
    "#...################",
    "####################",
    "####################",
    "####################",
  ],
};

// The one request the arena specs expect the fake model to answer with cover (`AskingForAnArena`, "low cover blocks to crouch behind"),
// word for word: the canned arena has none, so a spec asking for cover could not tell a model that kept it from one that dropped it.
const COVER_REQUEST = "an arena with low cover blocks to crouch behind";

const COVER_REPLY = {
  name: "Low Wall Hall",
  rows: [
    "####################",
    "#..................#",
    "#...cc........cc...#",
    "#..................#",
    "#...cc........cc...#",
    "#..................#",
    "####################",
  ],
};

const REQUEST_BLOCK = /^<request>\n([\s\S]*)\n<\/request>$/;

/**
 * The fake tier's arena generator: a chat model that answers the generation function call like a real one. It draws a valid arena for
 * every request but three: an arena with cover blocks for the cover request, a floor cut in two for the cut-in-two request (which code mends), and, for the
 * solid-wall request, an arena with almost no floor on every try, repair included (which code cannot). Test-only.
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
    if (requests.includes(CUT_IN_TWO_REQUEST)) {
      return CUT_IN_TWO_REPLY;
    }

    if (requests.includes(UNREPAIRABLE_REQUEST)) {
      return UNREPAIRABLE_REPLY;
    }

    if (requests.includes(COVER_REQUEST)) {
      return COVER_REPLY;
    }

    return FAKE_ARENA_REPLY;
  }
}
