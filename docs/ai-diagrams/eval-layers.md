# The layers a spec talks through

```mermaid
flowchart LR
  spec["*.eval.ts spec"] --> mapping["EvalCriteriaMapping<br/>given, when, eachTrial,<br/>beforeAll, thenExpect, expect"]
  mapping --> dsl["DSL<br/>WeaponDsl, ArenaDsl, AppearanceDsl"]
  dsl --> pipeline["Pipeline<br/>holds the answer, runs evaluators"]
  pipeline --> driver["Driver for the tier<br/>fake / local / paid"]
  driver --> generate["generateWeapon / generateArena"]
  generate --> stategraph["LangGraph StateGraph"]
  stategraph --> models["chat models"]
```

A spec may import only `EvalCriteriaMapping` (lint enforces this). The DSL and the Pipeline match acceptance-tests' `GunsmithDsl` over
`GunsmithPlaywright`: the DSL turns a failure into one sentence, and the Pipeline is the only class that knows how to reach the system
under test.

For the whole run, from the tier to the results file, see [how an eval run works](eval-run.md).
