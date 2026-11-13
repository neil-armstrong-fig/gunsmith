/** The body of a `given` or a `when`: what it holds is defined by calling the mapping's own functions. */
export type DefineBlock = () => void;

/** `when` for a criterion that must hold (a regression), and `when.capability` for one that is a hill to climb. */
export interface WhenBlock {
  (description: string, define: DefineBlock): void;
  capability(description: string, define: DefineBlock): void;
}
