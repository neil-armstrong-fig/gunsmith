import {friendCodeOfText} from "@src/react/components/dom/game-menu/components/room-entry/friend-code/FriendCodeOfText";
import {makeRoom} from "@src/react/components/dom/game-menu/components/room-entry/make-room/MakeRoom";
import {roomAddressOf} from "@src/react/components/dom/game-menu/components/room-entry/room-address/RoomAddressOf";
import type {FormEvent, JSX, KeyboardEvent} from "react";
import {useLayoutEffect, useRef, useState} from "react";

const NOT_A_FRIEND_CODE = "That is not a friend code: it is six letters and digits.";
const NO_ROOM_MADE = "A room could not be made. Try again.";

/**
 * How a player reaches a private room from the practice range: make one, which gives a friend code to pass on, or type a friend code in.
 * Either goes to the room's page and keeps the page's own query, which tunes the room. The box keeps its keys to itself, so a typed `m` or `w` is not the game's, and every part that takes the pointer keeps its presses from the game, so none fires a shot.
 */
export function RoomEntry(): JSX.Element {
  const [typed, setTyped] = useState("");
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [making, setMaking] = useState(false);
  const requestRef = useRef<AbortController | undefined>(undefined);

  useLayoutEffect(() => {
    return () => {
      requestRef.current?.abort();
    };
  }, []);

  const makeTheRoom = async (): Promise<void> => {
    if (requestRef.current) return;

    const controller = new AbortController();
    requestRef.current = controller;
    setMaking(true);
    setMessage(undefined);

    const code = await makeRoom(location, controller.signal);
    if (controller.signal.aborted) return;

    requestRef.current = undefined;
    setMaking(false);
    if (!code) {
      setMessage(NO_ROOM_MADE);
      return;
    }

    location.assign(roomAddressOf(code, location.search));
  };

  const joinTheRoom = (event: FormEvent): void => {
    event.preventDefault();
    if (requestRef.current) return;

    const code = friendCodeOfText(typed);
    if (!code) {
      setMessage(NOT_A_FRIEND_CODE);
      return;
    }

    location.assign(roomAddressOf(code, location.search));
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        disabled={making}
        className="pointer-events-auto rounded-md border border-gs-edge/25 bg-gs-background/45 px-3 py-2 text-sm font-semibold text-gs-ui-text"
        onMouseDown={event => {
          event.stopPropagation();
        }}
        onClick={() => {
          void makeTheRoom();
        }}
      >
        Make a room
      </button>

      <form
        className="pointer-events-auto flex w-full flex-wrap items-center gap-2"
        onSubmit={joinTheRoom}
        onKeyDown={keepToTheBox}
        onMouseDown={event => {
          event.stopPropagation();
        }}
      >
        <input
          type="text"
          aria-label="Friend code"
          placeholder="Friend code"
          autoComplete="off"
          spellCheck={false}
          className="min-w-28 flex-1 rounded-md border border-gs-edge/25 bg-gs-background/45 px-2 py-2 text-sm text-gs-ui-text"
          value={typed}
          onChange={event => {
            setTyped(event.target.value);
          }}
        />

        <button
          type="submit"
          disabled={making}
          className="rounded-md border border-gs-edge/25 bg-gs-background/45 px-3 py-2 text-sm font-semibold text-gs-ui-text"
        >
          Join a room
        </button>
      </form>

      {message && (
        <p
          role="alert"
          className="pointer-events-auto max-w-56 rounded-md bg-gs-ui-surface px-3 py-2 text-xs text-gs-ui-text"
          onMouseDown={event => {
            event.stopPropagation();
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

function keepToTheBox(event: KeyboardEvent): void {
  event.stopPropagation();
}
