import {join, relative} from "node:path";
import {filesBelow} from "@gunsmith/shared/config/repository/discovery/FilesBelow.ts";
import {artifactFailures} from "@gunsmith/shared/config/repository/artifacts/file/ArtifactFailures.ts";

/** Every failure in the scripts under `docs/art`, as `path message`. */
export function artScriptFailures(root: string): string[] {
  const artifacts = filesBelow(join(root, "docs/art")).filter(file => /\.(html|js|mjs|ts|tsx)$/.test(file));
  return artifacts.flatMap(file => artifactFailures(file).map(failure => `${relative(root, file)} ${failure}`));
}
