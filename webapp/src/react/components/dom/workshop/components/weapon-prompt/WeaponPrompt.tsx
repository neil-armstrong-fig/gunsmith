import {WEAPON_PROMPT_LIMIT} from "@src/react/components/dom/workshop/components/weapon-prompt/limit/WeaponPromptLimit";
import {standInWeaponFor} from "@src/react/components/dom/workshop/components/weapon-prompt/stand-in/StandInWeaponFor";
import {WorkshopPrompt} from "@src/react/components/dom/workshop/components/workshop-prompt/WorkshopPrompt";
import {useWorkshopStore} from "@src/store/workshop/UseWorkshopStore";
import type {JSX} from "react";

export function WeaponPrompt(): JSX.Element {
  const prompt = useWorkshopStore(state => state.prompt);

  return (
    <WorkshopPrompt
      id="workshop-weapon-prompt"
      label="Describe your weapon"
      prompt={prompt}
      limit={WEAPON_PROMPT_LIMIT}
      onPromptChange={useWorkshopStore.getState().setPrompt}
      onMake={() => {
        useWorkshopStore.getState().setWeapon(standInWeaponFor(prompt));
      }}
    />
  );
}
