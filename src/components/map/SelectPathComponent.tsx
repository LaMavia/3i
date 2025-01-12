import { Marker } from "react-leaflet";
import { ShowPathComponent } from "./ShowPathComponent";
import { StateContext } from "./StateManager";
import { useContext } from "react";
import { ClickCallback } from "./ClickCallback";

export function SelectPathComponent() {
  const { state, setState } = useContext(StateContext);

  return (
    <>
      <ShowPathComponent />
      <ClickCallback
        setMode={() => {}}
        callback={(p) =>
          setState?.((state) => ({ ...state, path: [...state.path, p] }))
        }
      />
      {state?.path.map((p, i) => (
        <Marker
          key={`${p}`}
          position={p}
          opacity={0.5}
          title={(i + 1).toString()}
        />
      ))}
    </>
  );
}
