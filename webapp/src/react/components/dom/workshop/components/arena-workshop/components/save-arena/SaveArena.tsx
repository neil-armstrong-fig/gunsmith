import {ArenaReplacementPicker} from "@src/react/components/dom/workshop/components/arena-workshop/components/save-arena/components/arena-replacement-picker/ArenaReplacementPicker";
import {SaveArenaButton} from "@src/react/components/dom/workshop/components/arena-workshop/components/save-arena/components/save-arena-button/SaveArenaButton";
import {SavedArenaButton} from "@src/react/components/dom/workshop/components/arena-workshop/components/save-arena/components/saved-arena-button/SavedArenaButton";
import {ARENA_SHELF_LIMIT} from "@src/store/shelf/arena/limits/ArenaShelfLimit";
import {useArenaShelfStore} from "@src/store/shelf/arena/UseArenaShelfStore";
import {useArenaWorkshopStore} from "@src/store/workshop/arena/UseArenaWorkshopStore";
import type {WorkshopArena} from "@src/store/workshop/arena/types/WorkshopArena";
import type {JSX} from "react";
import {useState} from "react";

interface Props {
  result: WorkshopArena;
  prompt: string;
}

export function SaveArena({result, prompt}: Props): JSX.Element {
  const [askedAbout, setAskedAbout] = useState<WorkshopArena>();
  const arenas = useArenaShelfStore(state => state.arenas);
  const savedId = useArenaWorkshopStore(state => state.savedId);
  const saved = arenas.some(item => item.id === savedId);
  const replacing = askedAbout === result && arenas.length >= ARENA_SHELF_LIMIT;
  const draft = {name: result.name, rows: result.rows, prompt};

  const save = (): void => {
    const id = useArenaShelfStore.getState().save(draft);
    if (id === undefined) {
      setAskedAbout(result);
      return;
    }

    useArenaWorkshopStore.getState().setSavedId(id);
  };

  const replace = (itemId: string): void => {
    const id = useArenaShelfStore.getState().replace(itemId, draft);
    if (id !== undefined) {
      useArenaWorkshopStore.getState().setSavedId(id);
    }

    setAskedAbout(undefined);
  };

  const cancel = (): void => {
    setAskedAbout(undefined);
  };

  if (saved) {
    return <SavedArenaButton />;
  }

  if (replacing) {
    return <ArenaReplacementPicker arenas={arenas} onReplace={replace} onCancel={cancel} />;
  }

  return <SaveArenaButton onSave={save} />;
}
