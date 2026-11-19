/** A session to keep: the hash of its token (never the token itself), whose it is and when it stops working. */
export interface NewSession {
  idHash: string;
  userId: string;
  expiresAt: Date;
}
