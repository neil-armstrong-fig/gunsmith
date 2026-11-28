# Arena graph

Drawn from `ai/src/pipeline/arena/graph/CreateArenaGraph.ts` and `routing/RouteAfterValidate.ts`.

Node colours: **model calls** are amber and **code** is blue. The shared design of both graphs is in [the index](README.md#how-the-graphs-are-put-together).

```mermaid
flowchart TD
  start(["START"]) --> precheck["precheck<br/>prompt length"]
  precheck -->|"rejected, refunded"| doneRejected(["END: rejected"])
  precheck --> moderation["moderation<br/>is it an arena request?"]
  moderation -->|"rejected"| doneRejected
  moderation --> generate["generate<br/>model draws the arena in the format"]
  generate --> validate["validate<br/>code mends what it can, then checks"]
  validate -->|"passed"| doneCreated(["END: arena made"])
  validate -->|"refused, repair unspent"| repair["repair<br/>faults go back to the model once"]
  validate -->|"refused after repair"| doneInvalid(["END: invalid, with a reason<br/>nothing given in its place"])
  repair --> validate

  format[/"format: formatOfStyle(style)<br/>or DEFAULT_ARENA_FORMAT"/] -.-> generate
  format -.-> validate
  format -.-> repair

  classDef model fill:#fde68a,stroke:#b45309,color:#1f2937
  classDef code fill:#bfdbfe,stroke:#1d4ed8,color:#1f2937
  class moderation,generate,repair model
  class precheck,validate code
```

- **Model calls:** 2 on a clean run and 3 at most.
- The same format is used for the first try and for the repair. Only a request turned away before any model call is refunded.
