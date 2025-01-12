import { createFileRoute } from "@tanstack/react-router";
import {
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { useContext, useEffect, useRef, useState } from "react";
import { MapRef } from "react-leaflet/MapContainer";
import { LeafletMouseEvent } from "leaflet";
import { Center, HStack } from "@chakra-ui/react";
import { Provider } from "@/components/ui/provider";
import { Button } from "@/components/ui/button";
import { Point } from "@/utils/point";
import { StateContext } from "@/components/map/StateManager";
import { ShowPathComponent } from "@/components/map/ShowPathComponent";
import { ClickCallback } from "@/components/map/ClickCallback";
import { UnexploredModeComponent } from "@/components/map/UnexploredModeComponent";
import { SelectPathComponent } from "@/components/map/SelectPathComponent";
import { PositionManager } from "@/components/map/PositionManager";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

enum Mode {
  Standard,
  Unexplored,
  SelectPath,
}

const ModeButtons = ({ mode }: { mode: Mode }): JSX.Element => {
  const { setState } = useContext(StateContext);

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

const ModeComponent = ({ mode }: { mode: Mode }) => {
  const { setState } = useContext(StateContext);

  if (mode == Mode.Standard) {
    return (
      <>
        <ShowPathComponent />
        <ClickCallback
          callback={(targetPos) => setState?.((s) => ({ ...s, targetPos }))}
        />
      </>
    );
  } else if (mode == Mode.Unexplored) {
    return (
      <>
        <UnexploredModeComponent />
        <ClickCallback
          callback={(targetPos) => setState?.((s) => ({ ...s, targetPos }))}
        />
      </>
    );
  } else if (mode == Mode.SelectPath) {
    return <SelectPathComponent />;
  }
};

function HomeComponent() {
  const { state } = useContext(StateContext);
  const [mode, setMode] = useState<Mode>(Mode.Standard);
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
        className="h-[600px]"
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {state?.pos && <Marker position={state.pos} />}
        <ModeComponent mode={mode} />
      </MapContainer>
      <Center>
        <HStack>
          <Button
            onClick={() => {
              setMode(Mode.Standard);
            }}
          >
            Standard
          </Button>
          <Button
            onClick={() => {
              setMode(Mode.Unexplored);
            }}
          >
            Unexplored
          </Button>
          <Button
            onClick={() => {
              setMode(Mode.SelectPath);
            }}
          >
            Select Path
          </Button>
        </HStack>
      </Center>
      <Center>
        <ModeButtons mode={mode} />
      </Center>
    </>
  );
}
