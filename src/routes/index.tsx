import { createFileRoute } from "@tanstack/react-router";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  Rectangle,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { Button, Container } from "@chakra-ui/react";
import { useGeolocation } from "@uidotdev/usehooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapRef } from "react-leaflet/MapContainer";
import { LeafletMouseEvent } from "leaflet";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const TILE_SIZE = 0.001;
const SPEED = 0.003;
const MIN_DIST_FOR_POINT = 0.0001

type Point = [number, number]

const pointAdd = (p1: Point, p2: Point): Point => [p1[0] + p2[0], p1[1] + p2[1]];
const pointSub = (p1: Point, p2: Point): Point => [p1[0] - p2[0], p1[1] - p2[1]];
const pointDistFromOrigin = (p: Point): number => Math.sqrt(p[0] * p[0] + p[1] * p[1]);

function ClickCallback({
  setTargetPos,
}: {
  setTargetPos: (val: Point) => void;
}) {
  useMapEvents({
    click: (e: LeafletMouseEvent) => {
      debugger;
      setTargetPos([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

const tilePos = (p: Point): Point => {
  const conv1D = (x: number) => Math.floor(x / TILE_SIZE);
  return [conv1D(p[0]), conv1D(p[1])];
};

const tileCorner = (x: Point): Point => {
  return [x[0] * TILE_SIZE, x[1] * TILE_SIZE];
};

const tileCenter = (p: Point): Point => {
  return tileCorner(pointAdd(p, [0.5, 0.5]));
};

type State = {
  pos: [number, number];
  targetPos: [number, number];
  line: [number, number][];
}

const forTileInRange = (pos: Point, range: number, callback: (tile: Point, closeness: number) => void) => {
  const TILE_OFFSET = Math.ceil(range / TILE_SIZE)
  let startTile = tilePos(pos);

  for (let dx = -TILE_OFFSET; dx <= TILE_OFFSET; ++dx) {
    for (let dy = -TILE_OFFSET; dy <= TILE_OFFSET; ++dy) {
      let tile: Point = [startTile[0] + dx, startTile[1] + dy]
      let curTileCenter = tileCenter(tile)
      let diff = pointDistFromOrigin(pointSub(curTileCenter, pos))
      if (diff > range) {
        continue
      }
      const closeness = 1 - diff / range
      callback(tile, closeness)
    }
  }
}

type SetState = React.Dispatch<React.SetStateAction<State>>

function ShowPathComponent({state, setState}: {state: State, setState: SetState}) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const update = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const dt = (time - previousTimeRef.current) / 1000;
      setState(({ pos, targetPos, line }) => {
        const diff = [targetPos[0] - pos[0], targetPos[1] - pos[1]];
        const diffLen = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);

        let nextPos: [number, number];

        if (targetPos[0] == pos[0] && targetPos[1] == pos[1]) {
          nextPos = pos
        }
        else if (diffLen <= Math.max(dt, 0.0001) * SPEED) {
          nextPos = targetPos;
        } else {
          const scale = (dt * SPEED) / diffLen;
          nextPos = [pos[0] + diff[0] * scale, pos[1] + diff[1] * scale];
        }

        let nextLines = line;
        if (line.length > 0) {
          const last_point = line[line.length - 1]
          const nextPointDiffV = [last_point[0] - pos[0], last_point[1] - pos[1]]
          const nextPointDiff = Math.sqrt(nextPointDiffV[0] * nextPointDiffV[0] + nextPointDiffV[1] * nextPointDiffV[1])
          if (nextPointDiff > MIN_DIST_FOR_POINT) {
            nextLines = line.concat([pos])
          }
        }
        else {
          nextLines = [pos]
        }

        return { pos: nextPos, targetPos: targetPos, line: nextLines };
      });
    }

    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      requestRef.current && cancelAnimationFrame(requestRef.current);
    };
  }, []); // Make sure the effect runs only once
  return (<Polyline positions={state.line.concat([state.pos])} />)
}

function UnexploredModeComponent({state}: {state: State}) {
  const MAX_DIST = 0.02

  const pointToId = (p: Point) => p[0] + "_" + p[1];

  let explored = new Map<String, number>([]);
  let rects: [Point, Point, number][] = []

  state.line.forEach((p) => {
    forTileInRange(p, TILE_SIZE * 3, (t, closeness) => {
      let t_id = pointToId(t)
      closeness = Math.min(closeness * 2, 1)
      let prevDist = explored.get(t_id);
      if (prevDist === undefined) {
        prevDist = 0
      }
      if (prevDist < closeness) {
        explored.set(t_id, closeness)
      }
    })
  })

  forTileInRange(state.pos, MAX_DIST, (tile, closeness) => {
    let dist = explored.get(pointToId(tile))
    if (dist === undefined) {
      dist = 0
    }
    rects.push(
      [tileCorner(tile), tileCorner(pointAdd(tile, [1, 1])), Math.min(closeness, (1 - dist))]
    )
  })

  return (<>{rects.map(([p1, p2, closeness]) => 
    <Rectangle bounds={[p1, p2]} stroke={false} fillOpacity={0.8*Math.pow(closeness, 0.6)}/>
  )}</>)
}

function HomeComponent() {
  const [state, setState] = useState<State>({
    pos: [52.21126, 20.98183],
    targetPos: [52.21126, 20.98183],
    line: [],
  });

  const [map, setMap] = useState<MapRef>(null);

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [map]);

  enum Mode {
    Standard,
    Unexplored,
  };

  const [mode, setMode] = useState<Mode>(Mode.Standard)

  const ModeComponent = () => {
    if (mode == Mode.Standard) {
      return <ShowPathComponent state={state} setState={setState}/>
    }
    else if (mode == Mode.Unexplored) {
      return <UnexploredModeComponent state={state}/>
    }
  }

  return (
    <>
      <MapContainer
        center={state.pos}
        zoom={13}
        scrollWheelZoom={true}
        className="h-[600px]"
        ref={setMap}
      >
        <ClickCallback
          setTargetPos={(targetPos) => setState((s) => ({ ...s, targetPos }))}
        />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={state.pos} />
        <ModeComponent/>
      </MapContainer>
      <Button onClick={() => {setMode(Mode.Standard)}} variant="solid">Standard</Button>
      <Button onClick={() => {setMode(Mode.Unexplored)}} variant="solid">Unexplored</Button>
    </>
  );
}
