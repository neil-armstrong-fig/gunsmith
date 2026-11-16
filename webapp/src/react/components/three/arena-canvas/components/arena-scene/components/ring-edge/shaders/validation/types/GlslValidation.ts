/** What the compiler made of a shader: whether it is valid, and everything it said. */
export interface GlslValidation {
  valid: boolean;
  /** The compiler's own words, errors and warnings, with line numbers that count the few lines of three.js's declarations put ahead of the source. */
  log: string;
}
