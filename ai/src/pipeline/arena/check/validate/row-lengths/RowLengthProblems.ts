// The first few wrong rows are enough to show the model what to fix; a drawing of thirty ragged rows would flood the repair.
const MAX_ROWS_LISTED = 3;

/**
 * What is wrong with the lengths of an arena's rows, in sentences the model can act on: which rows (counted from the top, as it
 * wrote them) are not as long as most rows are, and how long every row should be. Engine's `arenaFrom` refuses ragged rows too, but
 * without naming one, and a model counts characters badly, so it cannot find the row from that sentence. Nothing when the rows
 * are all one length.
 */
export function rowLengthProblems(rows: readonly string[]): string[] {
  const expected = mostCommonLength(rows);
  const wrongRows = rows.flatMap((row, index) => {
    if (row.length === expected) {
      return [];
    }

    return [{number: index + 1, length: row.length}];
  });

  const listed = wrongRows.slice(0, MAX_ROWS_LISTED).map(wrong => {
    return `Row ${wrong.number} (counting from the top) has ${wrong.length} characters, but most rows have ${expected}: make every row ${expected} characters long.`;
  });

  const unlisted = wrongRows.length - listed.length;
  if (unlisted === 0) {
    return listed;
  }

  return [...listed, `And ${unlisted} more rows of the wrong length.`];
}

/** The length most rows have; of two equally common lengths, the one that comes first. */
function mostCommonLength(rows: readonly string[]): number {
  const counts = new Map<number, number>();
  for (const row of rows) {
    counts.set(row.length, (counts.get(row.length) ?? 0) + 1);
  }

  let best = 0;
  let bestCount = 0;
  for (const [length, count] of counts) {
    if (count > bestCount) {
      best = length;
      bestCount = count;
    }
  }

  return best;
}
