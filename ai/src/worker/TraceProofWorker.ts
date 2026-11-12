import {awaitAllCallbacks} from "@langchain/core/callbacks/promises";
import {weaponProofGraph} from "@src/graph/WeaponProofGraph";

// The one method of Workers' ExecutionContext this spike uses (avoids a workers-types dependency).
interface WaitUntilContext {
  waitUntil(promise: Promise<unknown>): void;
}

// Spike only: three ways of ending a request, to see which one lets the trace upload finish.
export default {
  async fetch(request: Request, _env: unknown, ctx: WaitUntilContext): Promise<Response> {
    const mode = new URL(request.url).pathname;
    const started = Date.now();
    const result = await weaponProofGraph.invoke({prompt: "a mild rifle"});
    const note: string[] = [
      `tracingEnv=${process.env.LANGSMITH_TRACING ?? "unset"}`,
      `graphMs=${Date.now() - started}`,
    ];
    if (mode === "/await") {
      const outcome = await Promise.race([
        awaitAllCallbacks().then(() => "flushed"),
        new Promise<string>(resolve => setTimeout(() => resolve("timeout-5s"), 5000)),
      ]);
      note.push(`flush=${outcome}`, `flushMs=${Date.now() - started}`);
    }
    if (mode === "/waituntil") {
      ctx.waitUntil(awaitAllCallbacks());
    }
    return Response.json({weapon: result.weapon, note});
  },
};
