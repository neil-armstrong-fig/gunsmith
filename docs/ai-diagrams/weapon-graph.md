# Weapon graph

Drawn from `ai/src/pipeline/weapon/graph/CreateWeaponGraph.ts`, its `routing/` folder and `ai/src/pipeline/appearance/GenerateAppearance.ts`.

Node colours: **model calls** are amber and **code** is blue. The shared design of both graphs is in [the index](README.md#how-the-graphs-are-put-together).

```mermaid
flowchart TD
  start(["START"]) --> precheck["precheck<br/>prompt length"]
  precheck -->|"rejected"| doneRejected(["END: rejected"])
  precheck --> moderation["moderation<br/>is it a weapon request?"]
  moderation -->|"rejected"| doneRejected
  moderation --> generate["generate<br/>model writes the stats"]
  generate --> validate["validate<br/>zod parse, ranges"]
  validate -->|"passed"| balance["balance<br/>code brings stats inside the caps"]
  validate -->|"refused, repair unspent"| repair["repair<br/>faults go back to the model once"]
  validate -->|"refused after repair"| doneInvalid(["END: invalid"])
  balance --> rate["rate<br/>power rating, damage per second"]
  rate -->|"passed"| draw
  rate -->|"refused, repair unspent"| repair
  rate -->|"refused after repair"| doneInvalid
  repair --> validate

  subgraph draw ["draw: generateAppearance (plain code inside one node)"]
    direction TD
    drawGenerate["generate drawing"] --> check1["check<br/>fix, then validate"]
    check1 -->|"ok"| drawValid(["valid / completed"])
    check1 -->|"refused"| drawRepair["repair drawing"]
    drawRepair --> check2["check<br/>fix, then validate"]
    check2 -->|"ok"| drawRepaired(["repaired"])
    check2 -->|"refused"| drawFallback(["fallback<br/>disclosed stand-in"])
  end

  draw --> doneCreated(["END: created"])

  classDef model fill:#fde68a,stroke:#b45309,color:#1f2937
  classDef code fill:#bfdbfe,stroke:#1d4ed8,color:#1f2937
  class moderation,generate,repair,drawGenerate,drawRepair model
  class precheck,validate,balance,rate,check1,check2 code
```

- **Model calls:** 3 on a clean run (moderation, stats, drawing) and 5 at most (one repair for the stats, one for the drawing).
- A drawing that cannot be made still leaves a weapon that was created. The drawing reads only the player's words, never the stats, and
  adds its steps to `nodes` with an `appearance.` prefix.
- A rejected or invalid request draws nothing.
