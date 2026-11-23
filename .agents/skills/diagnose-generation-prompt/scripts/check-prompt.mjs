import { readFileSync } from "node:fs";
import { precheckArenaPrompt } from "../../../../ai/src/pipeline/arena/prompt-screening/precheck/PrecheckArenaPrompt.ts";
import { precheckNode as precheckWeapon } from "../../../../ai/src/pipeline/weapon-graph/screening/PrecheckNode.ts";
import { parsePromptRequest } from "../../../../api/src/router/routes/shared/prompt-request/ParsePromptRequest.ts";

const kind = process.argv[2];
if (
  (kind !== "arena" && kind !== "weapon") ||
  process.argv.length !== 3 ||
  process.stdin.isTTY
) {
  console.error("Usage: node check-prompt.mjs <arena|weapon> < prompt.txt");
  process.exit(2);
}

const prompt = readFileSync(0, "utf8");
const submittedPrompt = parsePromptRequest(JSON.stringify({ prompt }));
if (submittedPrompt === undefined) {
  console.log(
    JSON.stringify({
      kind,
      stage: "request-body",
      accepted: false,
      reason: "bad-request",
    }),
  );
} else if (kind === "arena") {
  console.log(
    JSON.stringify({
      kind,
      stage: "precheck",
      ...precheckArenaPrompt(submittedPrompt),
    }),
  );
} else {
  const { rejectionReason: reason } = precheckWeapon({
    prompt: submittedPrompt,
  });
  console.log(
    JSON.stringify({
      kind,
      stage: "precheck",
      accepted: reason === undefined,
      reason,
    }),
  );
}
