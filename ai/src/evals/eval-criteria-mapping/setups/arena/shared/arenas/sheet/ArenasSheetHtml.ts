import {escapeHtml} from "@evals/eval-criteria-mapping/environment/reporting/escape-html/EscapeHtml";
import type {ArenaDrawing} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/sheet/types/ArenaDrawing";
import type {KeptArena} from "@evals/eval-criteria-mapping/setups/arena/shared/arenas/types/KeptArena";

const STYLE = `
:root{color-scheme:dark;--bg:#151b22;--panel:#1e2630;--text:#e5eaf0;--muted:#91a2b2;--created:#8ad4b0;--invalid:#f5d45b;--rejected:#ff9b54}
@media (prefers-color-scheme:light){:root{--bg:#f4f6f8;--panel:#fff;--text:#1a2330;--muted:#5a6a7a;--created:#1c7a52;--invalid:#8a6d00;--rejected:#b3501a}}
body{margin:0;padding:16px;background:var(--bg);color:var(--text);font:14px/1.45 system-ui,sans-serif}
.cards{display:flex;flex-wrap:wrap;gap:16px}.card{margin:0;background:var(--panel);padding:10px;border-radius:8px;max-width:100%}
pre{margin:0 0 6px;font:12px/1.15 ui-monospace,monospace;overflow-x:auto}figcaption{font-size:12px;color:var(--muted)}
.prompt{color:var(--text);font-size:13px}.badge{text-transform:uppercase;font-size:11px;letter-spacing:.04em}
.created{color:var(--created)}.invalid{color:var(--invalid)}.rejected{color:var(--rejected)}
`;

/**
 * Every kept arena as one page, each beside the words that asked for it and how it ended, for a person to judge whether the model
 * drew what was asked for; the status and the call count are proxies and say nothing about that. The rows are the engine's own
 * drawing characters, shown as they are. Everything a player or a model wrote is escaped. An `invalid` request has no arena at all, and no built-in one is shown in its place (the user, 2026-11-21): its card
 * carries the reason the player was told.
 */
export function arenasSheetHtml(arenas: KeptArena[]): string {
  const cards = arenas.map(arena => card(arena)).join("");

  return [
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
    `<title>Arenas</title><style>${STYLE}</style></head><body>`,
    `<h1>Arenas</h1><div class="cards">${cards}</div></body></html>`,
  ].join("");
}

function card({prompt, outcome}: KeptArena): string {
  return [
    '<figure class="card">',
    drawingBlock(drawingOf(outcome.arena)),
    `<figcaption><span class="prompt">${escapeHtml(prompt)}</span><br>`,
    `<strong class="badge ${outcome.status}">${outcome.status}</strong> · ${calls(outcome.modelCalls)}${refunded(outcome.refunded)}`,
    `${reason(outcome.reason)}</figcaption></figure>`,
  ].join("");
}

function drawingBlock(drawing: ArenaDrawing | undefined): string {
  if (drawing === undefined) {
    return "";
  }

  return `<strong>${escapeHtml(drawing.name)}</strong><pre>${escapeHtml(drawing.rows.join("\n"))}</pre>`;
}

function calls(count: number): string {
  if (count === 1) {
    return "1 call";
  }

  return `${count} calls`;
}

function refunded(wasRefunded: boolean): string {
  if (wasRefunded) {
    return " · credit refunded";
  }

  return "";
}

function reason(why: string | undefined): string {
  if (why === undefined) {
    return "";
  }

  return `<br>${escapeHtml(why)}`;
}

/** The `{name, rows}` drawing in an outcome's arena, which is `unknown` until read, or nothing when it is not one. */
function drawingOf(arena: unknown): ArenaDrawing | undefined {
  if (typeof arena !== "object" || arena === null || !("name" in arena) || !("rows" in arena)) {
    return undefined;
  }

  const {name, rows} = arena;
  if (typeof name !== "string" || !Array.isArray(rows) || !rows.every(row => typeof row === "string")) {
    return undefined;
  }

  return {name, rows};
}
