import {usePressedKey} from "@src/react/hooks/use-pressed-key/UsePressedKey";
import {CombatSounds} from "@src/sound/CombatSounds";
import {WebAudioOutput} from "@src/sound/web-audio/WebAudioOutput";
import {useAppStore} from "@src/store/app/UseAppStore";
import {useEffect, useState} from "react";

/**
 * The fight's sounds, made once and given to the loop to tell what each step did. It starts the browser's audio with the
 * page and closes it with it, flips the mute with M, and cancels whatever is playing when the window loses focus (the
 * trigger is let go then too, so the next click needs a fresh press).
 */
export function useCombatSounds(): CombatSounds {
  const [output] = useState(() => new WebAudioOutput(() => useAppStore.getState().muted));
  const [sounds] = useState(() => new CombatSounds(output));

  useEffect(() => {
    output.start();
    window.addEventListener("blur", loseFocus);

    return () => {
      window.removeEventListener("blur", loseFocus);
      output.stop();
    };

    function loseFocus(): void {
      sounds.cancel();
    }
  }, [output, sounds]);

  usePressedKey("KeyM", () => {
    useAppStore.getState().toggleMuted();
    sounds.cancel();
  });

  return sounds;
}
