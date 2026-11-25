import {useThree} from "@react-three/fiber";
import {useSpritesReady} from "@src/react/sprites/hooks/use-sprites-ready/UseSpritesReady";
import {useEffect} from "react";

interface Props {
  onDrawn: (picture: string) => void;
}

/** Draws the scene once the arena's pictures have loaded and hands over what was drawn, as a PNG data address. Draws nothing of its own. */
export function CapturePicture({onDrawn}: Props): undefined {
  const {gl, scene, camera} = useThree();
  const picturesReady = useSpritesReady();

  useEffect(() => {
    if (!picturesReady) {
      return;
    }

    gl.render(scene, camera);
    onDrawn(gl.domElement.toDataURL("image/png"));
  }, [picturesReady, gl, scene, camera, onDrawn]);

  return undefined;
}
