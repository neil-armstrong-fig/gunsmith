# Focused case study: notes and outline

Gunsmith doubles as a case study in production AI engineering as [Focused](https://focused.io) describes it. This file holds
the research and the evidence checklist so the story can be written from real numbers once the build is done. Where the
write-up lives is decided later (`TODO.md`, open questions). Research read 2026-11-12; Focused's pages change, so re-read before
quoting.

## Who Focused say they are

A consultancy that builds AI agents integrated with existing business systems. LangChain's boutique partner (a quote
attributed to LangChain's CEO calls them "the expert in the LangChain ecosystem"), a Claude partner, and a Honeycomb partner.
Capabilities: Custom Agents, Reliable RAG, Custom Software Development, **Eval Driven Development**, **Observability**.
Engagement style: "we do with, not for"; senior engineers; knowledge transfer; they will advise against an agent when a
deterministic system fits better.

## Their stated practices, and where gunsmith shows each one

| Focused says | Source | Gunsmith evidence to collect |
| ------------ | ------ | ---------------------------- |
| Deterministic LangGraph workflows for predictable steps; agents only for genuinely reasoning-heavy ones; "agentic workflows should get less agentic" | LangGraph for Enterprise post; lab post | The pipeline is a fixed `StateGraph`. Show why no node needs autonomy. |
| Evals before release; "test your AI like you test your code"; "evals enable change" | Eval-driven development page | A dataset per generator, a regression gate in CI, a mutation proof that the gate can fail |
| Offline evals, online monitoring, production failures become dataset examples | Evaluation Pipelines for LangGraph Agents | `ai/evals/`, trace-to-dataset loop, results exported with date, commit, model, cost |
| Binary evaluators; deterministic first, then LLM-as-judge; calibrate the judge; majority vote at temperature 0 | same | Deterministic validators then a calibrated "interesting" judge; position-bias measurement |
| Thresholds scaled to dataset size (about 10% at 7 cases, 5% at 50) | same | The `evals.yml` gate |
| Observability as a deployment blocker; every node transition and tool call traced | LangGraph for Enterprise | LangSmith tracing from the first node; trace tags; a screenshot set |
| Model portability: a cheap model for routing, a bigger one for reasoning; swap with a config and an eval run | same | Cheap judge, stronger generator, fallback; a bake-off (Workers AI vs Claude) |
| "Runtime receipts": cost, authority and approvals attached to each work item | lab post | A per-generation receipt (credits, cost, outcome) |
| Security belongs at the tool-call boundary; guardrails | lab post | Injection suite, schema and caps as the real boundary, output moderation |
| Human-in-the-loop approval gates and interrupts | LangChain page | Optional flagged-prompt review queue with `interrupt` |
| OpenTelemetry and Honeycomb for SLIs and SLOs | Observability page | Optional latency spans |
| Self-hosted LangSmith on Kubernetes (data stays in the client's environment) | LangChain page | Context for the hosting comparison (`docs/ai-hosting.md`) |

## The gap this project can fill

Focused's pages say little about **cost and token control** (their enterprise post names only indirect measures: offloading
context and cheaper models for routing). Gunsmith has real numbers to offer there: a hard prompt-token pre-check,
per-user credits with an atomic ledger, AI Gateway spend limits split by user, a provider hard cap, a global kill switch with a
tested **shutdown drill**, and the honest fact that Cloudflare has no hard cap. That is the original contribution.

## Suggested structure of the write-up

1. The problem: natural language in, playable game content out, with a hostile audience and a bill.
2. The shape: one deterministic graph, and why it is not an agent.
3. The contract: a fixed schema validated in code; the model proposes, the engine disposes.
4. Cost control in layers, with the numbers and the drill.
5. Evals: datasets, evaluators, the calibrated judge, the gate, and the mutation proof.
6. Observability: traces, receipts, what a failure looked like.
7. What it cost (fixed and variable) and what I would change.
8. Process: the fuzzy frontend, ATDD, three personas working from one set of docs.

## Evidence checklist (fill in as you go)

- [ ] Cost per weapon, arena and judgement; generations per day under the $1 soft cap
- [ ] Pass rates per evaluator, before and after a deliberate regression (the gate failing)
- [ ] Judge calibration: agreement with ~50 human labels; position bias before and after the shuffle
- [ ] A trace screenshot set (a success, a rejection, a repair, a timeout)
- [ ] The shutdown drill: time to stop, what the player saw
- [ ] A failure that became a dataset example
- [ ] The hosting decision and its cost table
- [ ] Latency percentiles for the pre-round
- [ ] Lessons that surprised you

## Sources

- [focused.io](https://focused.io), [/langchain](https://focused.io/langchain),
  [/capabilities/eval-driven-development](https://focused.io/capabilities/eval-driven-development),
  [/capabilities/observability](https://focused.io/capabilities/observability), [/lab](https://focused.io/lab)
- [Evaluation Pipelines for LangGraph Agents](https://dev.to/focused_dot_io/evaluation-pipelines-for-langgraph-agents-2aoi)
- [LangGraph for Enterprise Agent Development](https://dev.to/focused_dot_io/langgraph-for-enterprise-agent-development-why-we-built-our-entire-practice-on-it-4p31)
- Lab posts to read in full before writing: "Agentic Workflows Should Get Less Agentic", "AI Agent Testing Runs on Failure
  Traces", "Benchmarking LLMs for Structured Data Extraction", "AI Agents in Finance Live or Die by Runtime Receipts", "AI
  Agent Security Happens at the Tool Call" (all under focused.io/lab/)
- Local: `langsmith-learning/docs/CURRICULUM.md`; the personal-site `ai-native-delivery` case study (same NL → validated
  JSON pattern) and the `fuzzy-frontend` post
