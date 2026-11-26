import type {CreditBalance} from "@src/store/credits/types/CreditBalance";

/** The workshop's credit line: "7 of 10 credits left today · Make costs 1 credit". */
export function creditLine({balance, dailyAllowance, makePrice}: CreditBalance): string {
  return `${balance} of ${dailyAllowance} credits left today · Make costs ${makePrice} ${creditWord(makePrice)}`;
}

function creditWord(count: number): string {
  if (count === 1) {
    return "credit";
  }

  return "credits";
}
