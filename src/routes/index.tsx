import { createFileRoute } from "@tanstack/react-router";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { useContext, useEffect, useState } from "react";
import { MapRef } from "react-leaflet/MapContainer";
import { Center, HStack } from "@chakra-ui/react";
import { Button } from "@/components/ui/button";
import { StateContext } from "@/components/map/StateManager";
import { ShowPathComponent } from "@/components/map/ShowPathComponent";
import { ClickCallback } from "@/components/map/ClickCallback";
import { UnexploredModeComponent } from "@/components/map/UnexploredModeComponent";
import { SelectPathComponent } from "@/components/map/SelectPathComponent";
import { PositionManager } from "@/components/map/PositionManager";
import { Mode } from "@/types/Mode";
import { MENU_HEIGHT } from "@/components/gui/Menu";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const ModeButtons = (): JSX.Element => {
  const { setState, state } = useContext(StateContext);
  const mode = state?.mode;

  if (mode == Mode.SelectPath) {
    const resetPath = () => {
      setState?.((state) => ({ ...state, path: [] }));
    };
    return (
      <HStack>
        <Button onClick={resetPath}>Reset Path</Button>
        <Button>Create Path</Button>
      </HStack>
    );
  }

  return <></>;
};

const ModeComponent = () => {
  const { state, setState } = useContext(StateContext);

  if (state?.mode == Mode.Standard) {
    return (
      <>
        <ShowPathComponent />
        <ClickCallback
          callback={(targetPos) => setState?.((s) => ({ ...s, targetPos }))}
        />
      </>
    );
  } else if (state?.mode == Mode.Unexplored) {
    return (
      <>
        <UnexploredModeComponent />
        <ClickCallback
          callback={(targetPos) => setState?.((s) => ({ ...s, targetPos }))}
        />
      </>
    );
  } else if (state?.mode == Mode.SelectPath) {
    return <SelectPathComponent />;
  }
};

function HomeComponent() {
  const { state, setState } = useContext(StateContext);
  const [map, setMap] = useState<MapRef>(null);

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [map]);

  return (
    <>
      <PositionManager />
      <MapContainer
        center={state?.pos ?? [0, 0]}
        zoom={13}
        scrollWheelZoom={true}
        className={`h-[calc(100vh-${MENU_HEIGHT})]`}
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {state?.pos && <Marker position={state.pos} />}
        <ModeComponent />
      </MapContainer>
    </>
  );
}
