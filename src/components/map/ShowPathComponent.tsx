import { useContext } from "react";
import { StateContext } from "./StateManager";
import { Polyline } from "react-leaflet";

export function ShowPathComponent() {
  const { state } = useContext(StateContext);

  return (
    <>
      <Polyline positions={state?.line.concat([state.pos]) ?? []} />
    </>
  );
}
