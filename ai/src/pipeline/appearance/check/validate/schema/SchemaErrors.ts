import type {ZodError} from "zod";
import {shortenError} from "@gunsmith/ai/pipeline/appearance/check/validate/schema/shorten/ShortenError";

/** One short sentence for each way the answer misses the schema, each naming the path it concerns (`body.2.points`). */
export function schemaErrors(error: ZodError): string[] {
  return error.issues.map(issue => {
    const where = issue.path.length > 0 ? issue.path.join(".") : "appearance";

    return shortenError(`${where}: ${issue.message}`);
  });
}
