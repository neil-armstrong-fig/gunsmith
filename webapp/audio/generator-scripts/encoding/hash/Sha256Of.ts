import {createHash} from "node:crypto";

/** The lowercase hex SHA-256 of some bytes, which is how a master and an export are named in a report. */
export function sha256Of(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}
