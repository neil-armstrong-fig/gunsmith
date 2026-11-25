import {DrawingQueue} from "@src/react/components/three/arena-preview-canvas/components/still-picture/hooks/use-turn-to-draw/queue/DrawingQueue";
import {useEffect, useState} from "react";

/**
 * Six pictures drawn at once, with the game's canvas and one live preview, stays well under the sixteen WebGL contexts a browser keeps,
 * and gets through a list of twenty arenas in four turns (two at once left a saved arena, listed last, undrawn for seconds under load).
 */
const STILL_PICTURES = new DrawingQueue(6);

/** Whether it is this picture's turn to be drawn: asked for until `drawn`, given back once it is or when the picture goes. */
export function useTurnToDraw(drawn: boolean): boolean {
  const [turn, setTurn] = useState(false);

  useEffect(() => {
    if (drawn) {
      return undefined;
    }

    const giveBack = STILL_PICTURES.request(() => {
      setTurn(true);
    });

    return () => {
      giveBack();
      setTurn(false);
    };
  }, [drawn]);

  return turn && !drawn;
}
