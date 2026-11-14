import {isRecord} from "@gunsmith/ai/pipeline/appearance/check/fix/IsRecord";
import {decodeContainer} from "@gunsmith/ai/pipeline/appearance/check/fix/unwrap/decode/DecodeContainer";
import {unwrapPartPoints} from "@gunsmith/ai/pipeline/appearance/check/fix/unwrap/points/UnwrapPartPoints";
import type {AppearanceFix} from "@gunsmith/ai/pipeline/appearance/check/fix/types/AppearanceFix";
import type {ContainerField} from "@gunsmith/ai/pipeline/appearance/check/fix/unwrap/types/ContainerField";

const CONTAINER_FIELDS: ContainerField[] = [
  {name: "body", container: "array"},
  {name: "projectile", container: "array"},
  {name: "palette", container: "object"},
  {name: "impact", container: "object"},
  {name: "animation", container: "object"},
];

const PART_LISTS = ["body", "projectile"];

/**
 * Reads the nested fields of an answer that the model wrote as text, then the `points` of its parts that it wrote as text: the
 * first of the two code steps before the strict check, and the only one that replaces something the model wrote (and then only a
 * string, where a list or record is required, by what the string itself holds). It says which fields it read.
 */
export function unwrapEncodedFields(candidate: unknown): AppearanceFix {
  if (!isRecord(candidate)) {
    return {candidate, changes: []};
  }

  const unwrapped: Record<string, unknown> = {...candidate};
  const changes: string[] = [];

  for (const field of CONTAINER_FIELDS) {
    const decoded = decodeContainer(unwrapped[field.name], field.container);
    if (decoded !== undefined) {
      unwrapped[field.name] = decoded;
      changes.push(field.name);
    }
  }

  for (const listName of PART_LISTS) {
    const rewritten = unwrapPartPoints(unwrapped[listName]);
    if (rewritten.changed) {
      unwrapped[listName] = rewritten.parts;
      changes.push(`${listName}.points`);
    }
  }

  return {candidate: unwrapped, changes};
}
