# A cheaper judge for the prompt gate: desk research (2026-11-22)

**Question (the user, 2026-11-22):** could a tiny, cheap judge such as TypeSafe's Jev, or a small model on Cloudflare, replace Haiku for moderation and the other checks, leaving Haiku for the generation and repair calls?

**Decision (the user, 2026-11-22): not worth doing.** The saving is about $0.0001 a request, and a second vendor would see every player prompt; Haiku stays the judge. Reopen only if moderation latency or its false-positive rate becomes a measured problem, or Haiku's price changes. **Status:** desk research only. No model was called, no key was added, nothing is built. Every number below is a vendor claim or a small third-party test unless it says "ours".

## What the gate is today

There is **one judgement** in two prompts, and everything else that "checks" is code (the length pre-check, zod, engine's `validateArena`, the balancer, the arena repair).

| Call | Where | Question it answers | Verdict | Cost (ours, measured) |
| --- | --- | --- | --- | --- |
| Weapon moderation | `pipeline/prompt-screening/moderation/` (`MODERATION_PROMPT`) | Is this a request for a weapon? | `{isWeaponRequest, reason}` | about $0.00015 (153 µ$), 1 call, a weapon costs about $0.001 in all |
| Arena moderation | `pipeline/arena/prompt-screening/moderation/` | Is this a request for an arena? | `{isArenaRequest, reason}` | about $0.00015, 1 call, an arena costs about $0.0005 in all |
| Arena submission screening (deleted 2026-11-25: no consumer) | was `pipeline/arena-submission/screening/` | the same arena judge, once per player's prompt (two in a pre-round) | the same | the same, times two |

It is a **task-fit and prompt-injection gate, not a safety classifier**: "worn armour, recipes, questions, chat, code" are turned away; a shield, a silly or non-English weapon passes; text inside `<request>` is data, never instructions. A failed or unparsable call is a closed verdict (the request is rejected, and the route charges 0.5 credit for a rejection). The reason is shown to the player.

So the most a cheaper judge can save is about $0.0001 a request (10 to 30% of one request's cost). **The case for it is latency and keeping Haiku free of a call that does not need it, not money.** The cost of a wrong answer is not symmetric: a false positive turns away an honest player and charges them half a credit; a false negative lets a non-weapon through to a generation call (about $0.001) that the validators will mostly fail anyway.

## Candidates

| Candidate | What it is | Fits this gate? | Facts and caveats |
| --- | --- | --- | --- |
| **Jev** (TypeSafe AI, "System One") | A non-generative classifier/scorer/router: you give plain-English criteria and a schema, it returns a typed answer **with probabilities**. No explanations, no free text. | Yes for the yes/no; **no for the player-facing reason** (it cannot write one; a fixed sentence per verdict would replace it). | Hosted API (access terms not found). Claimed 70 to 500 ms, $0.042 per million input tokens, about $0.0004 a case. NearHere: 96% against 86% for Gemini Flash-Lite on listing moderation. An independent comparison found it **fastest and cheapest but the most over-flagging of benign requests**, better at rule-like than judgement-like tasks. Closed model, small samples, released days before the sources. Needs a key and a new vendor that sees player text. |
| **Llama Guard 3 8B** on Workers AI (`@cf/meta/llama-guard-3-8b`) | Meta's safety classifier (hazard categories) | **No.** It judges harm, not "is this a weapon request". It could only be a second, optional safety gate. | $0.484 per million input, $0.03 output on Workers AI; no new vendor. |
| **Llama 3.2 1B and 3B Instruct** on Workers AI | The smallest general text models in the catalog | Possible with the same prompt and a JSON answer, **unmeasured**; a 1B model reading an injection-hardened prompt is the doubt. | Same account and binding as the rest; billed in neurons with a daily free allowance. Output needs the zod parse and a closed verdict on failure, as now. |
| **Gemma 2B (LoRA)**, DistilBERT SST-2 on Workers AI | A 2B base with adapters; a sentiment classifier | No: not an instruct model; sentiment is the wrong label. | Listed so they are not re-checked. |
| Haiku 5.5 (today) | The baseline | Yes: it passed the moderation criteria in the paid runs so far (specs at 1 to 3 trials) | $0.00015 a call; its latency is in the paid call log (`stage` `moderation`), not yet summarised. |

Workers AI has no Jev. A Worker could call Jev with `fetch`, so it stays Workers-safe (`ai/` allows no Node-only APIs).

## What a fair comparison needs (nothing here is run)

1. **A labelled set, 30 to 50 prompts per gate**, paired across candidates: benign real requests (short, silly, non-English, a shield, "a box"), the near misses (armour, a healing item, a character), non-requests (recipes, chat, code, questions about the instructions) and injections ("ignore the above and ..."). The existing specs hold about 11 not-a-weapon/not-an-arena cases and `TryingToBreakTheSmith`; the set must grow from real failures as the eval notes say. The weapon and arena cases are different questions, so each candidate is measured on both.
2. **Metrics, in the order that matters:** false-positive rate on benign requests (**the bar: no worse than Haiku's** on the same set, to be measured); false-negative rate on non-requests and injections; p50 and p95 latency in the Worker; cost per decision; run-to-run agreement; and the failure rate of the call itself (a closed verdict is the cost of an outage, so a new vendor adds an availability dependency to every request).
3. **Success bar, written before any run** (to be confirmed by the user): at least as many false-positive-free benign cases as Haiku, a false-negative rate no worse, and the p95 at least 2 times faster. If it only matches Haiku on cost it is not worth a second vendor.
4. **Shape if it wins:** the cheap judge as the first pass and **Haiku as the fall-back** when it errors, times out or reports a probability near the threshold (Arize suggests the same: run the classifier on everything, sample or escalate the uncertain). Keep Haiku's written reason for rejections, since Jev cannot give one.

## Gates that belong to the user

- **A new vendor sees every player prompt** (TypeSafe), or a new Workers AI binding and billing line (ship, budget). Adding a provider, a key or a dependency is on the ask-before list in the root `AGENTS.md`.
- **Spend:** a first measurement is small (about 100 prompts times 5 candidates, under $0.05 at the quoted rates) but needs the user's go and a ceiling, and a TypeSafe account or a Cloudflare API token for the free local runs. Nothing is added or called until then.
- **Priority:** the saving is small and generation is the MVP gate. This is a latency and robustness refinement, so it can wait until the real adapter has run live.

## Sources

- [TypeSafe's Jev: Can decision models replace LLM judges?](https://arize.com/blog/typesafe-jev-llm-judge/) (Arize)
- [Same Attack, Different Judge: Jev, LLM judges and purpose-built safety classifiers](https://arxiv.org/pdf/2610.17820) (independent comparison)
- [Evaluating and Benchmarking the System One Model Jev](https://arxiv.org/pdf/2609.37647)
- [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) and the [Workers AI model catalog](https://developers.cloudflare.com/workers-ai/models/)
- [Llama Guard 3 8B on Workers AI](https://developers.cloudflare.com/ai/models/@cf/meta/llama-guard-3-8b/)
