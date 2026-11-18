import {useAppStore} from "@src/store/app/UseAppStore";
import type {JSX} from "react";

/**
 * In an online room, a line over the top of the arena while the connection to the server is being made again after it was lost. The seat
 * is kept for the player, so it only says the match is waiting for them to be heard; it shows nothing otherwise. It re-renders only when
 * the connection is lost or comes back.
 */
export function ConnectionNotice(): JSX.Element | undefined {
  const reconnecting = useAppStore(state => state.reconnecting);
  if (!reconnecting) {
    return undefined;
  }

  return (
    <div
      role="status"
      data-testid="connection-notice"
      className="pointer-events-none fixed top-16 left-1/2 -translate-x-1/2 rounded-md bg-gs-ui-surface/80 px-4 py-2 shadow-lg"
    >
      <span className="text-lg text-gs-ui-text">Connection lost. Reconnecting…</span>
    </div>
  );
}
