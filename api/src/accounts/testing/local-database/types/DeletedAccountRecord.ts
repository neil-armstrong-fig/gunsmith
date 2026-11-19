/** A record of a deleted account as the table holds it: the digest, the credit id and when to forget them, in whole seconds. */
export interface DeletedAccountRecord {
  subjectDigest: string;
  creditAccountId: string;
  keepUntilSeconds: number;
}
