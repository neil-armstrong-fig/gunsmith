import {standInArenaFor} from "@src/react/components/dom/workshop/components/arena-workshop/components/arena-prompt/stand-in/StandInArenaFor";
import {WorkshopPrompt} from "@src/react/components/dom/workshop/components/workshop-prompt/WorkshopPrompt";
import type {ArenaStyle} from "@gunsmith/shared/arena-style/ArenaStyle";
import {useArenaWorkshopStore} from "@src/store/workshop/arena/UseArenaWorkshopStore";
import type {JSX} from "react";

const ARENA_PROMPT_LIMIT = 1000;

export function ArenaPrompt(): JSX.Element {
  const prompt = useArenaWorkshopStore(state => state.prompt);
  const style = useArenaWorkshopStore(state => state.style);

  return (
    <WorkshopPrompt
      id="workshop-arena-prompt"
      label="Describe your arena"
      prompt={prompt}
      limit={ARENA_PROMPT_LIMIT}
      borderClassName={borderOf(style)}
      placeholder="Try a yard with a pillar or a raised platform with stairs"
      onPromptChange={useArenaWorkshopStore.getState().setPrompt}
      onMake={() => {
        useArenaWorkshopStore.getState().setResult({...standInArenaFor(prompt), madeFromPrompt: prompt});
      }}
    />
  );
}

/** The prompt box's border, in the colour of the style the player chose, so the choice is seen where the words are written. */
function borderOf(style: ArenaStyle): string {
  if (style === "red") {
    return "border-2 border-gs-ring";
  }

  return "border-2 border-gs-team-blue";
}
