import type {ITEM_KINDS} from "@src/accounts/schema/ItemKinds";

/** What a generated item is: a weapon or an arena. Each has its own space on the shelf. */
export type ItemKind = (typeof ITEM_KINDS)[number];
