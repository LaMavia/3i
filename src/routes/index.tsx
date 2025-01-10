import { createFileRoute } from "@tanstack/react-router";
import { MapContainer, Marker, Popup, Rectangle, TileLayer, useMapEvents, } from "react-leaflet";
import { Container } from "@chakra-ui/react";
import { useGeolocation } from "@uidotdev/usehooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapRef } from "react-leaflet/MapContainer";
import {LeafletMouseEvent} from "leaflet";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});


function HomeComponent() {
  const TILE_SIZE = 0.0002
  const speed = 0.003

  const [pos, setPos] = useState<[number, number]>([52.21126, 20.98183]);
  const [targetPos, setTargetPos] = useState<[number, number]>(pos);
  const [frame, setFrame] = useState<number>(Date.now());
  const [tiles, setTiles] = useState<Array<[number, number]>>(new Array());

  const [map, setMap] = useState<MapRef>(null);

  function ClickThingy() {
    useMapEvents({
      click: (e: LeafletMouseEvent) => {
        setTargetPos([e.latlng.lat, e.latlng.lng])
      }
    })
    return null
  }

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [map]);

  const tilePos = (x: number, y: number): [number, number] => {
    const conv1D = (x: number) => Math.floor(x / TILE_SIZE)
    return [conv1D(x), conv1D(y)]
  }

  const tileCorner = (x: number, y: number): [number, number] => {
    return [x * TILE_SIZE, y * TILE_SIZE]
  }

  const tileCenter = (x: number, y: number): [number, number] => {
    return tileCorner(x + 0.5, y + 0.5)
  }

  const update = () => {
    const tile = tilePos(pos[0], pos[1]);
    const TILE_OFFSET = 3
    var newTiles: [number, number][] = []
    for (var dx = -TILE_OFFSET; dx <= TILE_OFFSET; ++dx) {
      for (var dy = -TILE_OFFSET; dy <= TILE_OFFSET; ++dy) {
        const curTile = tileCenter(tile[0] + dx, tile[1] + dy)
        const diff = [curTile[0] - pos[0], curTile[1] - pos[1]]
        const diffLenAngle = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1])
        const diffLenTile = diffLenAngle / TILE_SIZE
        if (diffLenTile > TILE_OFFSET - 0.5) {
          continue
        }
        const dtile: [number, number] = [tile[0] + dx, tile[1] + dy]
        if (!(tiles.some(v => v[0] == dtile[0] && v[1] == dtile[1]))) {
          newTiles.push(dtile)
        }
      }
    }
    if (newTiles.length > 0) {
      var tiles_: Array<[number, number]> = tiles;
      newTiles.forEach((tile) => {
        tiles_.push(tile)
      })
      setTiles(tiles_)
    }
    const nextFrame = Date.now()
    var dt = (nextFrame - frame) / 1000
    var diff = [targetPos[0] - pos[0], targetPos[1] - pos[1]]
    var diffLen = Math.sqrt(diff[0] * diff[0] + diff[1] * diff[1])
    if (diffLen <= Math.max(dt, 0.0001) * speed) {
      setPos(targetPos)
    }
    else {
      const scale = (dt * speed) / diffLen
      setPos([pos[0] + diff[0] * scale, pos[1] + diff[1] * scale])
    }
    setFrame(nextFrame);
  };

  setTimeout(update, 10);

  return (
    <MapContainer
      center={pos}
      zoom={13}
      scrollWheelZoom={true}
      className="h-[600px]"
      ref={setMap}
    >
      <ClickThingy/>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={pos}/>
      {
        Array.from(tiles).map(([i1, i2], _) => {
          const bounds: [[number, number], [number, number]] = [tileCorner(i1, i2), tileCorner(i1 + 1, i2 + 1)];
          return (<Rectangle bounds={bounds} stroke={false} fillColor={'green'} fillOpacity={0.5}/>);
        })
      }
    </MapContainer>
  );
}
