import { useContext } from "react";
import { StateContext } from "./StateManager";
import { Mode } from "@/types/Mode";
import { MapOverlay } from "../gui/MapOverlay";
import { cn } from "@/utils/cn";
import { MENU_HEIGHT } from "../gui/Menu";

export const ModeButtons = (): JSX.Element => {
  const { setState, state } = useContext(StateContext);
  const mode = state?.mode;

  if (mode == Mode.SelectPath) {
    const resetPath = () => {
      setState?.((state) => ({ ...state, path: [] }));
    };
    return (
      <MapOverlay
        className={cn(
          "inset-[unset] inset-x-0 w-full flex",
          `bottom-[${MENU_HEIGHT}]`,
        )}
      >
        <div className="flex flex-col bg-gray-800 w-full [*>&]:w-full h-fit">
          <button className="h-10" onClick={resetPath}>
            Reset Path
          </button>
          <button className="h-10">Create Path</button>
        </div>
      </MapOverlay>
    );
  }

  return <></>;
};
