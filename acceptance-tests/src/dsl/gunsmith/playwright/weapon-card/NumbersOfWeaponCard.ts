import type {Locator} from "@playwright/test";
import type {RevealedWeaponNumbers} from "@src/dsl/gunsmith/playwright/weapon-card/types/RevealedWeaponNumbers";

/** What a weapon card prints (the reveal's, or the other player's weapon while choosing): its name, its power rating and each stat row. */
export async function numbersOfWeaponCard(card: Locator): Promise<RevealedWeaponNumbers> {
  const stats: Record<string, string> = {};
  for (const row of await card.getByTestId("reveal-stat").all()) {
    stats[(await row.getByTestId("reveal-stat-label").innerText()).trim()] = (
      await row.getByTestId("reveal-stat-value").innerText()
    ).trim();
  }

  return {
    name: (await card.getByTestId("reveal-weapon-name").innerText()).trim(),
    rating: Number.parseInt(await card.getByTestId("reveal-weapon-rating").innerText(), 10),
    stats,
  };
}
