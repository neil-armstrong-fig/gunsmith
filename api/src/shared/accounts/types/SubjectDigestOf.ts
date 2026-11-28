/** Turns a Google subject into the keyed digest that stands for it once the account is deleted. */
export type SubjectDigestOf = (googleSub: string) => Promise<string>;
