import type {SubjectDigestOf} from "@src/accounts/types/SubjectDigestOf";

/** How an account is removed: the keyed digest to remember its person by (given the Google subject, which never leaves `accounts/`) and when to forget it. */
export interface AccountRemoval {
  subjectDigest: SubjectDigestOf;
  keepUntil: Date;
}
