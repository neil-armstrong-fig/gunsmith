import type {ESLint} from "eslint";
import {importSpacing} from "@gunsmith/shared/config/standards/import-spacing/ImportSpacing.ts";
import {noReturnTernary} from "@gunsmith/shared/config/standards/return-ternary/NoReturnTernary.ts";
import {namedObjectTypes} from "@gunsmith/shared/config/standards/named-types/NamedObjectTypes.ts";
import {singleExport} from "@gunsmith/shared/config/standards/single-export/SingleExport.ts";
import {functionOrder} from "@gunsmith/shared/config/standards/function-order/FunctionOrder.ts";
import {helperFunctionDeclaration} from "@gunsmith/shared/config/standards/helper-declaration/HelperFunctionDeclaration.ts";

/** The project's own ESLint rules (`gunsmith/...`), for the standards in `AGENTS.md` that no stock rule enforces. */
export const standardsPlugin: ESLint.Plugin = {
  rules: {
    "function-order": functionOrder,
    "helper-function-declaration": helperFunctionDeclaration,
    "import-spacing": importSpacing,
    "no-return-ternary": noReturnTernary,
    "named-object-types": namedObjectTypes,
    "single-export": singleExport,
  },
};
