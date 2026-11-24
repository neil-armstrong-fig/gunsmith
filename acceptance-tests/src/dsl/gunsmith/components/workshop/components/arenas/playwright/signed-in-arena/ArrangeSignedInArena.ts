import type {ArenaWorkshopSetup} from "@src/dsl/gunsmith/components/workshop/components/arenas/types/ArenaWorkshopSetup";
import {expect, type Page} from "@playwright/test";

const ID = "foundry-from-the-server";
const PROMPT = "a wide industrial yard";
const FALLBACK_PROMPT = "two watchtowers and a raised bridge";
const ARENA = {
  name: "Foundry",
  rows: [
    "############",
    "#..........#",
    "#..........#",
    "#...##.....#",
    "#..........#",
    "#.....##...#",
    "#..........#",
    "#..........#",
    "############",
  ],
};

export async function arrangeSignedInArena(page: Page, setup: ArenaWorkshopSetup): Promise<void> {
  let saved = setup !== "ready";

  await page.route("**/api/me", async route => {
    await route.fulfill({json: {signedIn: true, displayName: "Arena maker"}});
  });

  await page.route("**/api/arenas", async route => {
    expect(route.request().method()).toBe("POST");
    const request: unknown = route.request().postDataJSON();
    if (typeof request === "object" && request !== null && "prompt" in request && request.prompt === FALLBACK_PROMPT) {
      expect(request).toEqual({prompt: FALLBACK_PROMPT, style: "blue"});
      await route.fulfill({
        json: {
          status: "builtIn",
          arena: {...ARENA, name: "Built-in yard"},
          reason: "We could not build a playable arena from that request, so here is one of ours.",
        },
      });
      return;
    }

    expect(request).toEqual({prompt: PROMPT, style: "blue"});
    if (setup === "paused") {
      await route.fulfill({status: 503, json: {error: "ai-off"}});
      return;
    }

    if (setup === "no-credits") {
      await route.fulfill({status: 402, json: {error: "no-credits"}});
      return;
    }

    await route.fulfill({json: {status: "created", id: ID, arena: ARENA}});
  });

  await page.route("**/api/library", async route => {
    if (route.request().method() === "POST") {
      expect(route.request().postDataJSON()).toEqual({id: ID});
      saved = true;
      await route.fulfill({json: {status: "saved"}});
      return;
    }

    expect(route.request().method()).toBe("GET");
    const arenas = [];
    if (saved) {
      arenas.push({id: ID, prompt: PROMPT, savedAt: "2026-11-20T12:00:00.000Z", arena: ARENA});
    }

    await route.fulfill({json: {limits: {weapons: 8, arenas: 3}, weapons: [], arenas}});
  });
}
