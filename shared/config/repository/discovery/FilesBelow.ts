import {readdirSync, existsSync} from "node:fs";
import {join} from "node:path";

const EXCLUDED_DIRECTORIES = new Set(["node_modules", "dist", "build", "coverage", "test-results"]);

/** Every file below `directory`, however deep, leaving out hidden folders and build output. */
export function filesBelow(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    if (entry.name.startsWith(".") || EXCLUDED_DIRECTORIES.has(entry.name)) {
      return [];
    }

    const file = join(directory, entry.name);
    if (entry.isDirectory()) {
      return filesBelow(file);
    }
    if (entry.isFile()) {
      return [file];
    }

    return [];
  });
}
