/** What a first sign-in creates: the opaque id and generated display name the new account will carry, and when it was made. */
export interface NewAccount {
  id: string;
  displayName: string;
  now: Date;
}
