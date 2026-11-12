import {FakeListChatModel} from "@langchain/core/utils/testing";
import {Annotation, END, START, StateGraph} from "@langchain/langgraph";
import {weaponProofSchema} from "@gunsmith/ai/graph/WeaponProof";
import type {WeaponProof} from "@gunsmith/ai/graph/WeaponProof";

const FIXED_REPLY = JSON.stringify({name: "Proof Rifle", damage: 20, rateOfFire: 6});

const WeaponProofState = Annotation.Root({
  prompt: Annotation<string>(),
  weapon: Annotation<WeaponProof | undefined>(),
});

/** One node, no network: a fake model returns a fixed reply, which is `unknown` until zod has parsed it. */
export const weaponProofGraph = new StateGraph(WeaponProofState)
  .addNode("generate", generate)
  .addEdge(START, "generate")
  .addEdge("generate", END)
  .compile();

async function generate(state: typeof WeaponProofState.State): Promise<{weapon: WeaponProof}> {
  const model = new FakeListChatModel({responses: [FIXED_REPLY]});
  const message = await model.invoke(state.prompt);
  const reply: unknown = JSON.parse(String(message.content));
  return {weapon: weaponProofSchema.parse(reply)};
}
