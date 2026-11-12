import {weaponProofGraph} from "@src/graph/WeaponProofGraph";

// Spike only: the smallest Worker that runs the one-node graph, to measure the bundle for hosting option 3.
export default {
  async fetch(): Promise<Response> {
    const result = await weaponProofGraph.invoke({prompt: "a mild rifle"});
    return Response.json(result.weapon);
  },
};
