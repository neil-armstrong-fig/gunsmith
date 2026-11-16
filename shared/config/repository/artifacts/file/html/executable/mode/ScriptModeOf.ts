import type {ScriptMode} from "@gunsmith/shared/config/repository/artifacts/file/html/executable/types/ScriptMode.ts";

const JAVASCRIPT_TYPES = new Set(["", "text/javascript", "application/javascript"]);

/** How a `<script>` runs, from its attributes: as a module, as a classic script, or not at all (a data block, a template). */
export function scriptModeOf(attributes: string): ScriptMode | undefined {
  const match = /\btype\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attributes);
  const mediaType = (match?.[1] ?? match?.[2] ?? match?.[3] ?? "").split(";")[0]?.trim().toLowerCase() ?? "";
  if (mediaType === "module") {
    return "module";
  }
  if (JAVASCRIPT_TYPES.has(mediaType)) {
    return "script";
  }

  return undefined;
}
