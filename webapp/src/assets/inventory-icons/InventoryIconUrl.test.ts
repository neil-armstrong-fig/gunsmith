import {readFileSync} from "node:fs";
import {inventoryIconUrl} from "@src/assets/inventory-icons/InventoryIconUrl";
import {expect, it} from "vitest";

it.each(["rifle", "marksman-rifle", "submachine-gun"])("serves the approved %s inventory icon", identity => {
  const url = `/assets/ui/ui-weapon-${identity}.svg`;

  expect(inventoryIconUrl(identity)).toBe(url);

  const runtime = readFileSync(new URL(`../../../public${url}`, import.meta.url));
  const approved = readFileSync(
    new URL(`../../../../docs/art/concepts/inventory-display/weapons/${identity}/Icon.svg`, import.meta.url),
  );

  expect(runtime.equals(approved)).toBe(true);
});

it("leaves missing and unsupported icons to the HUD fallback", () => {
  expect(inventoryIconUrl(undefined)).toBeUndefined();
  expect(inventoryIconUrl("custom")).toBeUndefined();
  expect(inventoryIconUrl("/assets/ui/ui-weapon-rifle.svg")).toBeUndefined();
});
