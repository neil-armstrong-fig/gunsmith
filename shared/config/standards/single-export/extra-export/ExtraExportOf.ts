import type ts from "typescript";
import {isExported} from "@gunsmith/shared/config/standards/single-export/extra-export/exported/IsExported.ts";
import {isBundledExport} from "@gunsmith/shared/config/standards/single-export/extra-export/bundled/IsBundledExport.ts";
import {isValueWithDerivedTypes} from "@gunsmith/shared/config/standards/single-export/extra-export/derived/IsValueWithDerivedTypes.ts";
import {isClassWithInterfaces} from "@gunsmith/shared/config/standards/single-export/extra-export/class/IsClassWithInterfaces.ts";

/** The first export that makes a file export more than one subject, or `undefined` when it exports one (or a value with its derived types, or a class with the interfaces it needs). */
export function extraExportOf(sourceFile: ts.SourceFile): ts.Statement | undefined {
  const statements = sourceFile.statements.filter(isExported);
  const bundled = statements.find(isBundledExport);
  if (bundled) {
    return bundled;
  }

  const second = statements[1];
  if (!second) {
    return undefined;
  }

  if (isValueWithDerivedTypes(statements) || isClassWithInterfaces(statements)) {
    return undefined;
  }

  return second;
}
