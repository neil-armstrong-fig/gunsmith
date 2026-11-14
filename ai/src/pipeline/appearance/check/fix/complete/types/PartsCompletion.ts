/** The parts of one list after completion (anything that is not a record kept as it was), and the distinct fields filled, each labelled `listName.field`. */
export interface PartsCompletion {
  parts: unknown[];
  changes: string[];
}
