import type {PersonalInformationConfirmation} from "@src/router/routes/shared/generation-history/privacy/redaction/types/PersonalInformationConfirmation";

/** One kind of personal detail the redactor finds: what finds it, what replaces it, and an optional second check of what was found. */
export interface PersonalInformationPattern {
  pattern: RegExp;
  placeholder: string;
  confirms?: PersonalInformationConfirmation;
}
