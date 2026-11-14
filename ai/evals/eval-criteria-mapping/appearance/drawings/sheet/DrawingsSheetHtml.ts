import {appearanceSchema} from "@gunsmith/ai/pipeline/appearance/schema/Appearance";
import {appearanceSvg} from "@evals/eval-criteria-mapping/appearance/drawings/sheet/svg/AppearanceSvg";
import {escapeHtml} from "@evals/eval-criteria-mapping/appearance/drawings/sheet/escape/EscapeHtml";
import type {KeptDrawing} from "@evals/eval-criteria-mapping/appearance/drawings/types/KeptDrawing";

const CELL_SIZE = 220;

const STYLE = `
:root{color-scheme:dark;--bg:#151b22;--panel:#1e2630;--text:#e5eaf0;--muted:#91a2b2;--valid:#8ad4b0;--completed:#62b5ff;--repaired:#f5d45b;--fallback:#ff9b54}
@media (prefers-color-scheme:light){:root{--bg:#f4f6f8;--panel:#fff;--text:#1a2330;--muted:#5a6a7a;--valid:#1c7a52;--completed:#1c62a8;--repaired:#8a6d00;--fallback:#b3501a}}
body{margin:0;padding:16px;background:var(--bg);color:var(--text);font:14px/1.45 system-ui,sans-serif}
.cells{display:flex;flex-wrap:wrap;gap:16px}.cell{margin:0;width:${CELL_SIZE}px;background:var(--panel);padding:10px;border-radius:8px}
.cell svg{display:block;border-radius:4px}figcaption{font-size:12px;color:var(--muted);margin-top:6px}
.prompt{color:var(--text);font-size:13px}.badge{text-transform:uppercase;font-size:11px;letter-spacing:.04em}
.valid{color:var(--valid)}.completed{color:var(--completed)}.repaired{color:var(--repaired)}.fallback{color:var(--fallback)}
`;

/**
 * Every kept drawing as one page, each beside the words that asked for it and how it ended. For a person to judge whether it
 * reads as the prompt; the badge, the call count and the tokens are proxies and say nothing about that. Everything a player or a
 * model wrote is escaped. A `fallback` is the stand-in, not the model's drawing.
 */
export function drawingsSheetHtml(drawings: KeptDrawing[]): string {
  const figures = drawings.map(drawing => figure(drawing)).join("");

  return [
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
    `<title>Drawings</title><style>${STYLE}</style></head><body>`,
    `<h1>Drawings</h1><div class="cells">${figures}</div></body></html>`,
  ].join("");
}

function figure(drawing: KeptDrawing): string {
  const {outcome} = drawing;
  const parsed = appearanceSchema.safeParse(outcome.appearance);
  const picture = parsed.success ? appearanceSvg(parsed.data, CELL_SIZE) : "<p>no drawing</p>";
  const calls = `${outcome.modelCalls} call${outcome.modelCalls === 1 ? "" : "s"}`;
  const faults = outcome.errors.length === 0 ? "" : `<br>${escapeHtml(outcome.errors.slice(0, 3).join("; "))}`;

  return [
    '<figure class="cell">',
    picture,
    `<figcaption><span class="prompt">${escapeHtml(drawing.prompt)}</span><br>`,
    `<strong class="badge ${outcome.status}">${outcome.status}</strong> · ${calls} · ${outcome.usage.outputTokens} tokens out`,
    `${faults}</figcaption></figure>`,
  ].join("");
}
