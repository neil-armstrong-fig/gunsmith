# AI diagrams

Pictures of the evals and the LangGraph pipelines in `ai/`, one file each so each can be opened alone. The prose and the decisions are in
[AI pipeline](../ai-pipeline.md); the commands are in [ai/AGENTS.md](../../ai/AGENTS.md). Each diagram names the files it was drawn from: if those
files change, update the diagram too.

- [How an eval run works](eval-run.md): from `pnpm evals:<tier>` to the results file.
- [The layers a spec talks through](eval-layers.md): spec, mapping, DSL, Pipeline, driver, graph.
- [Weapon graph](weapon-graph.md): screening, stats with one repair, then the drawing.
- [Arena graph](arena-graph.md): screening, the arena with one repair.

## How the graphs are put together

Each pipeline is a fixed LangGraph `StateGraph`: no node picks its own tools or its own next step. The models are passed in
(`WeaponPipelineDependencies`, `ArenaPipelineDependencies`) and live in the nodes' closures, never in the state, so the state is plain
data. In the state, `nodes` and `modelCalls` only ever add up, while `errors` and `repaired` are overwritten by each check. An empty
`errors` means the last check passed. The run's outcome is read off its end state (`weaponOutcomeFromState`, `arenaOutcomeFromState`),
and `RequestUsage` counts the tokens.

## Where the graphs run

| Caller                                                                     | What it runs                                            | Models                            |
| -------------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------- |
| `api/src/router/routes/weapons/pipeline/RunWeaponPipeline.ts`              | `generateWeapon`, in the Worker                         | Anthropic, from the Worker's key  |
| `api/src/router/routes/arenas/pipeline/RunArenaPipeline.ts`                | `generateArena`, in the Worker                          | Anthropic, from the Worker's key  |
| Eval drivers (`ai/src/evals/eval-criteria-mapping/setups/`)                | `generateWeapon`, `generateArena`, `generateAppearance` | the tier's: fake, Ollama or Haiku |
| `ai/langgraph.json` (`pnpm dev` in `ai/`, LangGraph Studio): `weaponSmith` | `createWeaponGraph`, the real topology                  | canned, so no key and no network  |
| `ai/langgraph.json`: `arenaSmith`                                          | `createArenaGraph`, the real topology                   | canned, so no key and no network  |
