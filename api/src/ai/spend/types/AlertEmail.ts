/** One spend alert to be written as an email: how far through the month's cap the spend is, and who it is from and to. */
export interface AlertEmail {
  percent: number;
  spentMicrodollars: number;
  capMicrodollars: number;
  fromAddress: string;
  toAddress: string;
  messageId: string;
  date: Date;
}
