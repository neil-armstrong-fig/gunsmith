/** One scheduled source; cosmetic sound data, never a game weapon contract. */
export interface Voice {
  at: number;
  duration: number;
  frequency: number;
  endFrequency?: number;
  wave?: OscillatorType;
  noise?: boolean;
  seed?: number;
  cutoff?: number;
  highpass?: boolean;
  gain: number;
  pan?: number;
}
