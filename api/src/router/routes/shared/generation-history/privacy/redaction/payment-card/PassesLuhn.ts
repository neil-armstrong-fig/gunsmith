/**
 * Whether a run of digits passes the Luhn checksum every payment card number carries: from the right, every second digit is doubled
 * and its digits added (16 counts 7), and the total must be a multiple of 10. Lets the redactor tell a card number from any other
 * long number.
 */
export function passesLuhn(digits: string): boolean {
  let total = 0;
  for (const [place, character] of [...digits].reverse().entries()) {
    const digit = Number(character);
    if (place % 2 === 0) {
      total += digit;
    } else {
      total += sumOfDigits(digit * 2);
    }
  }

  return total % 10 === 0;
}

function sumOfDigits(number: number): number {
  return Math.floor(number / 10) + (number % 10);
}
