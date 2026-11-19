import {useEffect, useRef} from "react";

/**
 * Calls `onPress` once each time the key `code` (a `KeyboardEvent.code`) goes down, for as long as `enabled`; a held key's repeats are not
 * presses. For a key that does a thing once (open a panel, mute, reload). A key that is held, such as walking, is `useHeldKeys`.
 *
 * `onPress` may be a new function on every render: the latest one is called, and the listener is not set up again for it. Like any window
 * listener it hears only a key that reaches the window, so a component that stops `keydown` (the workshop's panel) keeps its typing from it.
 */
export function usePressedKey(code: string, onPress: (event: KeyboardEvent) => void, enabled = true): void {
  const latestOnPressRef = useRef(onPress);

  useEffect(() => {
    latestOnPressRef.current = onPress;
  });

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    window.addEventListener("keydown", press);

    return () => {
      window.removeEventListener("keydown", press);
    };

    function press(event: KeyboardEvent): void {
      if (event.code === code && !event.repeat) {
        latestOnPressRef.current(event);
      }
    }
  }, [code, enabled]);
}
