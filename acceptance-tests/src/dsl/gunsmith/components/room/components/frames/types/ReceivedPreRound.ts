/** What a browser was sent about the choosing before the match in one `preRound` frame, as far as a spec cares: what it was told of the other seat. */
export interface ReceivedPreRound {
  /** Whether the other seat's first weapon was named: the server must not before both seats have locked in their first. */
  opponentFirstWeaponShown: boolean;
  /** Whether the other seat's second weapon was named: the server must not before both seats have locked in their second. */
  opponentSecondWeaponShown: boolean;
  /** Whether the other seat's arena was shown: the server must not before both seats have locked in their arena. */
  opponentArenaShown: boolean;
}
