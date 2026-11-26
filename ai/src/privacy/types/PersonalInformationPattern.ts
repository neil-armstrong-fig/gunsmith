import type {PersonalInformationConfirmation} from "@gunsmith/ai/privacy/types/PersonalInformationConfirmation";

/** One kind of personal detail the redactor finds: what finds it, what replaces it, and an optional second check of what was found. */
export interface PersonalInformationPattern {
  pattern: RegExp;
  placeholder: string;
  confirms?: PersonalInformationConfirmation;
}
