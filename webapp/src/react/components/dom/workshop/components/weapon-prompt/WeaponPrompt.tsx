import {accountUrl} from "@src/account/AccountUrl";
import {makeAccountWeapon} from "@src/react/components/dom/workshop/components/weapon-prompt/account/MakeAccountWeapon";
import {useAccountLibraryStore} from "@src/store/account-library/UseAccountLibraryStore";
import {WEAPON_PROMPT_LIMIT} from "@src/react/components/dom/workshop/components/weapon-prompt/limit/WeaponPromptLimit";
import {standInWeaponFor} from "@src/react/components/dom/workshop/components/weapon-prompt/stand-in/StandInWeaponFor";
import {WorkshopPrompt} from "@src/react/components/dom/workshop/components/workshop-prompt/WorkshopPrompt";
import {useWorkshopStore} from "@src/store/workshop/UseWorkshopStore";
import type {JSX} from "react";

export function WeaponPrompt(): JSX.Element {
  const prompt = useWorkshopStore(state => state.prompt);

  const session = useAccountLibraryStore(state => state.session);
  const making = useWorkshopStore(state => state.making);
  const error = useWorkshopStore(state => state.makeError);

  const make = async (): Promise<void> => {
    const state = useWorkshopStore.getState();
    if (state.making || session === "checking") return;

    state.setMakeError(undefined);
    if (session === "guest") {
      state.setWeapon(standInWeaponFor(state.prompt));
      return;
    }

    state.setMaking(true);
    try {
      state.setAccountWeapon(await makeAccountWeapon(state.prompt));
    } catch (cause) {
      state.setMakeError(cause instanceof Error ? cause.message : "Could not make a weapon.");
    } finally {
      state.setMaking(false);
    }
  };

  return (
    <>
      <WorkshopPrompt
        id="workshop-weapon-prompt"
        label="Describe your weapon"
        prompt={prompt}
        limit={WEAPON_PROMPT_LIMIT}
        making={making}
        waiting={session === "checking"}
        onPromptChange={useWorkshopStore.getState().setPrompt}
        onMake={() => {
          void make();
        }}
      />

      {session === "guest" && (
        <a
          className="text-sm text-gs-team-blue underline"
          href={accountUrl(`/api/auth/google?return=${encodeURIComponent(window.location.href)}`)}
        >
          Sign in with Google to make and save weapons to your account
        </a>
      )}

      {error && (
        <p role="alert" data-testid="weapon-make-error" className="text-sm text-gs-ring">
          {error}
        </p>
      )}
    </>
  );
}
