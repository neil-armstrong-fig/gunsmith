import {ENCODER_SETTINGS} from "@gunsmith/audio-studies/encoding/settings/EncoderSettings";
import {VERIFICATION_LIMITS} from "@gunsmith/audio-studies/encoding/verification/limits/VerificationLimits";

/** The limits the page judges by: the same ones the native check uses, and the rate its decoder must give. */
export const PAGE_LIMITS = {...VERIFICATION_LIMITS, sampleRate: ENCODER_SETTINGS.sampleRate} as const;
