import {OnlineMatch} from "@src/online/OnlineMatch";
import {roomOfPage} from "@src/online/RoomOfPage";
import {roomSocketUrl} from "@src/online/socket/RoomSocketUrl";
import {useEffect, useRef} from "react";
import type {RefObject} from "react";

/**
 * The online match the page was opened for (`?room=<code>`), in a ref the loop reads each frame, or a ref holding nothing on any
 * other page. It connects just after the page mounts and lets go of the socket when it unmounts, so a double mount in development
 * opens one connection, not two.
 */
export function useOnlineMatch(): RefObject<OnlineMatch | undefined> {
  const matchRef = useRef<OnlineMatch | undefined>(undefined);

  useEffect(() => {
    const code = roomOfPage();
    if (!code) {
      return undefined;
    }

    // React's development double mount runs this effect, cleans it up and runs it again at once. A socket opened by the first run
    // completes its handshake before it is closed, and the server seats it: the second window's throwaway socket took the second seat,
    // began the match and left, and the real socket was refused as a full room. Connecting a tick later lets the cleanup cancel the
    // first run before it connects.
    const connecting = setTimeout(() => {
      matchRef.current = new OnlineMatch(new WebSocket(roomSocketUrl(location, code)));
    }, 0);

    return () => {
      clearTimeout(connecting);
      matchRef.current?.close();
      matchRef.current = undefined;
    };
  }, []);

  return matchRef;
}
