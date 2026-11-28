import {passesLuhn} from "@src/router/routes/shared/generation-history/privacy/redaction/payment-card/PassesLuhn";
import type {PersonalInformationPattern} from "@src/router/routes/shared/generation-history/privacy/redaction/types/PersonalInformationPattern";

const ADDRESS_SUFFIXES =
  "Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr|Close|Way|Court|Ct|Place|Pl|Boulevard|Blvd|Crescent|Terrace|Gardens|Grove|Square|Row|Mews";
const DOMAIN_ENDINGS =
  "com|net|org|io|co|uk|dev|app|me|gg|tv|info|xyz|ai|de|fr|eu|us|ca|au|ly|be|to|site|online|store|shop";

/**
 * In order: a pattern sees the text the ones before it left, so an email goes before a bare domain and a handle, a card before a
 * phone, and both before the bare long number. Tuned for recall on structured details: a game prompt is mostly words and small
 * numbers, and a false alarm only hides a few characters from the tuning history.
 */
const PERSONAL_INFORMATION_PATTERNS: PersonalInformationPattern[] = [
  {pattern: /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, placeholder: "[email]"},
  {pattern: /\b(?:https?:\/\/|www\.)\S*[^\s.,;:!?)\]]/gi, placeholder: "[url]"},
  {pattern: new RegExp(`\\b[a-z0-9-]+(?:\\.[a-z0-9-]+)*\\.(?:${DOMAIN_ENDINGS})\\b`, "gi"), placeholder: "[url]"},
  {pattern: /(?<![\w@])@\w{2,}/g, placeholder: "[handle]"},
  {pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g, placeholder: "[ip]"},
  {
    pattern: new RegExp(`\\b\\d{1,5}[A-Za-z]?\\s+(?:[A-Z][a-z]+\\s+){1,3}(?:${ADDRESS_SUFFIXES})\\b`, "g"),
    placeholder: "[address]",
  },
  {pattern: /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/g, placeholder: "[postcode]"},
  {pattern: /\b\d{5}-\d{4}\b/g, placeholder: "[postcode]"},
  {pattern: /\b\d{1,2}[/-]\d{1,2}[/-](?:\d{4}|\d{2})\b/g, placeholder: "[date]"},
  {pattern: /\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b/g, placeholder: "[date]"},
  {
    pattern: /\b(?:\d{4}([ -]?)\d{4}\1\d{4}\1\d{1,7}|\d{4}([ -]?)\d{6}\2\d{5})\b/g,
    placeholder: "[card]",
    confirms: isCardNumber,
  },
  {pattern: /\+\d[\d ()-]{5,}\d/g, placeholder: "[phone]", confirms: hasPhoneLength},
  {pattern: /\(\d{3}\)\s?\d{3}[ -]\d{4}\b/g, placeholder: "[phone]"},
  {pattern: /\b\d{2,6}(?:[ -]\d{2,6}){1,3}\b/g, placeholder: "[phone]", confirms: isGroupedPhoneNumber},
  {pattern: /\b\d{9,}\b/g, placeholder: "[id number]"},
];

/**
 * A prompt with the personal details code can recognise replaced by placeholders (`[email]`, `[phone]`, `[card]`, `[address]` …) and
 * everything else kept as it was. Best effort and deliberately simple: names and free-form details are not found, which the Make
 * notice discloses. The API keeps this, not the prompt, in a player's private generation history.
 */
export function redactPersonalInformation(prompt: string): string {
  let text = prompt;
  for (const {pattern, placeholder, confirms} of PERSONAL_INFORMATION_PATTERNS) {
    text = text.replace(pattern, match => {
      if (confirms !== undefined && !confirms(match)) return match;

      return placeholder;
    });
  }

  return text;
}

function isCardNumber(match: string): boolean {
  return passesLuhn(digitsOf(match));
}

function hasPhoneLength(match: string): boolean {
  const digitCount = digitsOf(match).length;

  return digitCount >= 7 && digitCount <= 15;
}

/** Spaced or dashed digits read as a phone number when long enough and holding a group of four or more (`555-123-4567`), not `120 150 200`. */
function isGroupedPhoneNumber(match: string): boolean {
  const digitCount = digitsOf(match).length;
  if (digitCount < 9 || digitCount > 15) return false;

  return match.split(/[ -]/).some(group => group.length >= 4);
}

function digitsOf(text: string): string {
  return text.replace(/\D/g, "");
}
