import { createFileRoute } from "@tanstack/react-router";
import {
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { useEffect, useRef, useState } from "react";
import { MapRef } from "react-leaflet/MapContainer";
import { LeafletMouseEvent } from "leaflet";
import { Center, HStack } from "@chakra-ui/react"
import { Provider } from "@/components/ui/provider";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const TILE_SIZE = 0.0004;
const SPEED = 0.009;
const MIN_DIST_FOR_POINT = 0.0001
const MAX_DIST = 0.05

const ratio = 120 / 75

type Point = [number, number]

const pointAdd = (p1: Point, p2: Point): Point => [p1[0] + p2[0], p1[1] + p2[1]];
const pointSub = (p1: Point, p2: Point): Point => [p1[0] - p2[0], p1[1] - p2[1]];
const pointDistFromOrigin = (p: Point): number => Math.sqrt(ratio * ratio * p[0] * p[0] + p[1] * p[1]);

function ClickCallback({
  callback: setTargetPos,
}: {
  callback: (val: Point) => void;
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
  return [Math.floor(p[0] / (TILE_SIZE / ratio)), Math.floor(p[1] / TILE_SIZE)];
};

const tileCorner = (x: Point): Point => {
  return [x[0] * TILE_SIZE / ratio, x[1] * TILE_SIZE];
};

const tileCenter = (p: Point): Point => {
  return tileCorner(pointAdd(p, [0.5, 0.5]));
};

type State = {
  pos: [number, number];
  targetPos: [number, number];
  line: [number, number][];
  path: [number, number][];
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
        const diff = pointSub(targetPos, pos);
        const diffLen = pointDistFromOrigin(diff);

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
          const nextPointDiff = pointDistFromOrigin(pointSub(last_point, pos))
          if (nextPointDiff > MIN_DIST_FOR_POINT) {
            nextLines = line.concat([pos])
          }
        }
        else {
          nextLines = [pos]
        }

        return {...state, pos: nextPos, line: nextLines };
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
  return (<>
    <Polyline positions={state.line.concat([state.pos])} />
  </>)
}

function SelectPathComponent({state, setState}: {state: State, setState: SetState}) {
  return <>
    <ShowPathComponent state={state} setState={setState}/>
    <ClickCallback callback={(p) => setState({...state, path: state.path.concat([p])})}/>
    <>{
      state.path.map((p, i) => <Marker key={i} position={p} opacity={0.5} title={(i+1).toString()}/>)
    }</>
  </>
}

function UnexploredModeComponent({state}: {state: State}) {
  const pointToId = (p: Point) => p[0] + "_" + p[1];

  let explored = new Map<String, number>([]);
  let rects: [Point, Point, number][] = []

  state.line.forEach((p) => {
    forTileInRange(p, 0.0014, (t, closeness) => {
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
    if (dist > 0.8) {
      return
    }
    rects.push(
      [tileCorner(tile), tileCorner(pointAdd(tile, [1, 1])), Math.min(closeness, (1 - dist))]
    )
  })

  // rects = rects.filter(([_1, _2, closeness]) => closeness < 0.5)

  let polygon = rects.map(([p1, p2, _]): Point[][] => {
    return [[p1, [p1[0], p2[1]], p2, [p2[0], p1[1]]]]
  })

  return (<Polygon positions={polygon} fillOpacity={0.6} stroke={false}/>)

  /*return (<>{rects.map(([p1, p2, closeness]) => 
    <Rectangle bounds={[p1, p2]} stroke={false} fillOpacity={0.8*Math.pow(closeness, 0.6)}/>
  )}</>)*/
}

enum Mode {
  Standard,
  Unexplored,
  SelectPath,
};

const ModeButtons = ({state, setState, mode}: {state: State, setState: SetState, mode: Mode}): JSX.Element => {
  if (mode == Mode.SelectPath) {
    const resetPath = () => {
      setState({...state, path: []})
    }
    return <HStack>
      <Button onClick={resetPath}>Reset Path</Button>
      <Button>Create Path</Button>
    </HStack>
  }
  return <></>
}

function HomeComponent() {
  const [state, setState] = useState<State>({
    pos: [52.21126, 20.98183],
    targetPos: [52.21126, 20.98183],
    line: [],
    path: [],
  });

  const [map, setMap] = useState<MapRef>(null);

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [map]);

  const [mode, setMode] = useState<Mode>(Mode.Standard)

  const ModeComponent = () => {
    if (mode == Mode.Standard) {
      return <><ShowPathComponent state={state} setState={setState}/>
          <ClickCallback
            callback={(targetPos) => setState((s) => ({ ...s, targetPos }))}
          />
      </>
    }
    else if (mode == Mode.Unexplored) {
      return <UnexploredModeComponent state={state}/>
    }
    else if (mode == Mode.SelectPath) {
      return <SelectPathComponent state={state} setState={setState}/>
    }
  }

  return (
    <Provider>
      <MapContainer
        center={state.pos}
        zoom={13}
        scrollWheelZoom={true}
        className="h-[600px]"
        ref={setMap}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={state.pos} />
        <ModeComponent/>
      </MapContainer>
      <Center>
        <HStack>
          <Button onClick={() => {setMode(Mode.Standard)}}>Standard</Button>
          <Button onClick={() => {setMode(Mode.Unexplored)}}>Unexplored</Button>
          <Button onClick={() => {setMode(Mode.SelectPath)}}>Select Path</Button>
        </HStack>
      </Center>
      <Center>
        <ModeButtons mode={mode} state={state} setState={setState}/>
      </Center>
    </Provider>
  );
}
