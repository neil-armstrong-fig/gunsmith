import type {Account} from "@src/accounts/types/Account";

/** A player a test signed in: their account and the `Cookie` header that carries their session. */
export interface SignedInPlayer {
  account: Account;
  cookie: string;
}
