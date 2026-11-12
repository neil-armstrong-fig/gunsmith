/** What a player asked for: the words they typed. Untrusted text, which the pipeline treats as data, never as instructions. */
export interface GenerateWeaponInput {
  prompt: string;
}
