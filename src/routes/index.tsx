import { createFileRoute } from "@tanstack/react-router";
import {
  MapContainer,
  Marker,
  Popup,
  Rectangle,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { Container } from "@chakra-ui/react";
import { useGeolocation } from "@uidotdev/usehooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapRef } from "react-leaflet/MapContainer";
import { LeafletMouseEvent } from "leaflet";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

const TILE_SIZE = 0.0001;
const speed = 0.003;

function ClickThingy({
  setTargetPos,
}: {
  setTargetPos: (val: [number, number]) => void;
}) {
  useMapEvents({
    click: (e: LeafletMouseEvent) => {
      debugger;
      setTargetPos([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

const tilePos = (x: number, y: number): [number, number] => {
  const conv1D = (x: number) => Math.floor(x / TILE_SIZE);
  return [conv1D(x), conv1D(y)];
};

const tileCorner = (x: number, y: number): [number, number] => {
  return [x * TILE_SIZE, y * TILE_SIZE];
};

const tileCenter = (x: number, y: number): [number, number] => {
  return tileCorner(x + 0.5, y + 0.5);
};

function HomeComponent() {
  const [state, setState] = useState<{
    pos: [number, number];
    targetPos: [number, number];
    tiles: [number, number][];
  }>({
    pos: [52.21126, 20.98183],
    targetPos: [52.21126, 20.98183],
    tiles: [],
  });
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const update = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const dt = (time - previousTimeRef.current) / 1000;

      setState(({ pos, targetPos, tiles }) => {
        const tile = tilePos(pos[0], pos[1]);
        const TILE_OFFSET = 3;
        const newTiles: [number, number][] = [];

        for (let dx = -TILE_OFFSET; dx <= TILE_OFFSET; ++dx) {
          for (let dy = -TILE_OFFSET; dy <= TILE_OFFSET; ++dy) {
            const curTile = tileCenter(tile[0] + dx, tile[1] + dy);
            const diff = [curTile[0] - pos[0], curTile[1] - pos[1]];
            const diffLenAngle = Math.sqrt(
              diff[0] * diff[0] + diff[1] * diff[1],
            );

            const diffLenTile = diffLenAngle / TILE_SIZE;
            if (diffLenTile > TILE_OFFSET - 0.5) {
              continue;
            }

            const dtile: [number, number] = [tile[0] + dx, tile[1] + dy];
            if (!tiles.some((v) => v[0] == dtile[0] && v[1] == dtile[1])) {
              newTiles.push(dtile);
            }
          }
        }

        const nextTiles = newTiles.length > 0 ? tiles.concat(newTiles) : tiles;

        const diff = [targetPos[0] - pos[0], targetPos[1] - pos[1]];
        const diffLen = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1]);

        let nextPos: [number, number];
        if (diffLen <= Math.max(dt, 0.0001) * speed) {
          nextPos = targetPos;
        } else {
          const scale = (dt * speed) / diffLen;
          nextPos = [pos[0] + diff[0] * scale, pos[1] + diff[1] * scale];
        }

        return { pos: nextPos, targetPos, tiles: nextTiles };
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

  const [map, setMap] = useState<MapRef>(null);

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [map]);

  return (
    <MapContainer
      center={state.pos}
      zoom={13}
      scrollWheelZoom={true}
      className="h-[600px]"
      ref={setMap}
    >
      <ClickThingy
        setTargetPos={(targetPos) => setState((s) => ({ ...s, targetPos }))}
      />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={state.pos} />
      {state.tiles.map(([i1, i2]) => {
        const bounds: [[number, number], [number, number]] = [
          tileCorner(i1, i2),
          tileCorner(i1 + 1, i2 + 1),
        ];
        return (
          <Rectangle
            key={`${i1}:${i2}`}
            bounds={bounds}
            stroke={false}
            fillColor={"green"}
            fillOpacity={0.5}
          />
        );
      })}
    </MapContainer>
  );
}
