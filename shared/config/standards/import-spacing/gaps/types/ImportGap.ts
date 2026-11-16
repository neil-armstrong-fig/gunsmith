/** A stretch of text after an import that does not follow the spacing rule, as offsets into the source. */
export interface ImportGap {
  start: number;
  end: number;
  replacement?: string;
}
