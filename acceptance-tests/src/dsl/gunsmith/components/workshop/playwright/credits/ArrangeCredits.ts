import type {Page} from "@playwright/test";

const DAILY_ALLOWANCE = 10;
const PRICES = {weapon: 1, rejected: 0.5};

/**
 * Answers `GET /api/credits` for a signed-in player who starts with `balance` credits and spends one on each Make the page
 * finishes (a weapon or an arena), so a criterion can see the balance follow what was made without a real ledger.
 */
export async function arrangeCredits(page: Page, balance: number): Promise<void> {
  let makes = 0;
  page.on("requestfinished", request => {
    if (request.method() === "POST" && /\/api\/(weapons|arenas)$/.test(new URL(request.url()).pathname)) {
      makes += 1;
    }
  });

  await page.route("**/api/credits", async route => {
    await route.fulfill({
      json: {balance: balance - makes, dailyAllowance: DAILY_ALLOWANCE, prices: PRICES, aiOn: true},
    });
  });
}
