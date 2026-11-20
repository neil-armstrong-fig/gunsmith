/** A seat puts the named built-in arena forward, not yet locked in. */
export interface ChooseArenaAction {
  kind: "chooseArena";
  name: string;
}
