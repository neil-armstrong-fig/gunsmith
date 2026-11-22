/** The Worker vars that may lower the spend caps, as the strings the runtime gives (`DAILY_SPEND_CAP_MICRODOLLARS`, `MONTHLY_SPEND_CAP_MICRODOLLARS`). */
export interface SpendCapSettings {
  daily?: string;
  monthly?: string;
}
