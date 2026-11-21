/**
 * The choice a group starts on: the one the player remembered if it is still offered, else the group's default, else the first on offer. A weapon or arena
 * that has left the shelf since it was remembered is only an id nothing matches, so the group quietly starts on its default.
 */
export function chosenChoiceOf<Choice extends {id: string}>(
  choices: readonly Choice[],
  rememberedId: string | undefined,
  defaultId: string,
): Choice | undefined {
  const remembered = choices.find(choice => choice.id === rememberedId);
  if (remembered) {
    return remembered;
  }

  return choices.find(choice => choice.id === defaultId) ?? choices[0];
}
