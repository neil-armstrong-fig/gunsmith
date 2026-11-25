# Eval execution and evidence

User decisions, 2026-11-17. Ship owns root commands and CI mechanics; AI owns
case classification, execution filtering, paid models, spending and reporting.
Production credit/spend policy stays separate.

## Free automatic checks

`pnpm evals` runs the complete fake harness, one trial per scenario, all fixture
criteria gating and tracing disabled. The command forces those settings even
when the caller has different eval settings. Fake scores prove harness behavior,
never live-model quality. The AI eval harness workflow runs for relevant AI,
engine, shared tooling and dependency changes, plus manual dispatch. It needs no
secrets or browser and preserves JSON summaries for fourteen days, including
failed runs. Result-only and AI documentation-only changes do not trigger it.
This independent check does not change the gameplay or property release gates.

## Paid policy — awaiting AI implementation

- Paid runs are manual and local only. No schedule, paid CI or merge-required
  paid result. A failed regression fails its own paid run.
- Every selected scenario generates three fresh trials, once per trial for all
  its criteria. All three must pass each regression criterion. Capability
  scenarios remain advisory; provider failures and incomplete execution fail.
- The intended paid root command defaults to regression scenarios; `--suite=all`
  adds capabilities. Execution filtering must skip unselected hooks/models;
  `EVAL_GATE=regression` alone only changes failure gating and still runs cases.
- No response-result cache. Prior outputs support comparison, debugging and
  deterministic evaluator tests; they never count as new model evidence.
- Retain every paid run in a dated, non-overwriting Git-eligible bundle with
  generated outputs, trial scores, scenario/model/settings, source fingerprints,
  token costs and completion state. Redact injected secrets; do not auto-commit.
- Keep tracing off by default. Deliberate baseline tracing remains opt-in and
  shares the existing LangSmith quota; free CI always disables it.
- Preserve pipeline repair limits, disable hidden model/SDK retries, and report
  budget/provider/truncation failures distinctly from model-quality failures.

The arena evals have had a paid tier since 2026-11-19 (an arena request costs
about $0.0005 to $0.0008 on Haiku 5.5) and follow the same three-trial rule.
Recount paid scenarios before enabling the new runner; the earlier planning
inventory predates arena integration and the 2026-11-25 promotions.

## Budget activation — blocked on reconciliation and implementation

The user replaces the former $1 lifetime allowance with **$5 per UTC month**,
with **$0.10 per regression run** and **$0.25 per full baseline**. This is policy
authorization, not permission to run the old unsafe guard. No paid calls until
the new guard is implemented and the opening balance is reconciled.

Use one locked durable ledger under `$XDG_STATE_HOME/gunsmith/evals/`, defaulting
to `~/.local/state/gunsmith/evals/`, shared by all local checkouts. Missing or
corrupt state fails closed. Reserve a run allowance before execution, reserve
conservative request costs before each call, reconcile returned usage, and keep
unknown charges reserved. Use atomic writes and fixed-precision costs. Never
silently clear a stale lock or refund an interrupted request. Stop new requests
when the run crosses a UTC month boundary; retain prior-month history.

No paid ledger or call logs were found in the eight current checkouts during
planning. The last documented total is about $0.6241, not a verified opening
balance. The user offered API Console logs: November Cost and Usage CSVs scoped
to Gunsmith can reconcile spend; they cannot recover generated samples. Do not
initialize at zero or print credentials/billing details.

After the 2026-11-25 promotions (arena, rejection and drawing specs became
regressions), a three-trial regression run is estimated at about $0.075 from
that day's batches (arena $0.018, weapon about $0.031, drawing $0.025), under
the $0.10 limit but close to it. These are estimates, not
reservations or bills. Re-measure after activation; the provider bill is the
accounting authority. Current pricing: [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing).

## AI delivery acceptance

Prove execution filtering, fresh three-trial sampling, complete/non-overwriting
evidence and regression/capability separation with fake transports. Prove shared
locking from separate checkout processes, missing/corrupt ledger failures,
reservation limits, unknown usage, crashes/recovery and UTC rollover. Mutation
proof must kill dropped trials, gates and admission checks. No automated
verification calls a paid model. Update AI instructions and legacy budget text
when the guard changes; do not describe this policy handoff as implementation.
