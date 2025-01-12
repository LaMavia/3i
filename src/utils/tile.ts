import { Point, pointAdd, pointDistFromOrigin, pointSub, ratio } from "./point";

const TILE_SIZE = 0.0004;

export const tilePos = (p: Point): Point => {
  return [Math.floor(p[0] / (TILE_SIZE / ratio)), Math.floor(p[1] / TILE_SIZE)];
};

export const tileCorner = (x: Point): Point => {
  return [(x[0] * TILE_SIZE) / ratio, x[1] * TILE_SIZE];
};

export const tileCenter = (p: Point): Point => {
  return tileCorner(pointAdd(p, [0.5, 0.5]));
};

export const forTileInRange = (
  pos: Point,
  range: number,
  callback: (tile: Point, closeness: number) => void,
) => {
  const TILE_OFFSET = Math.ceil(range / TILE_SIZE);
  let startTile = tilePos(pos);

  for (let dx = -TILE_OFFSET; dx <= TILE_OFFSET; ++dx) {
    for (let dy = -TILE_OFFSET; dy <= TILE_OFFSET; ++dy) {
      let tile: Point = [startTile[0] + dx, startTile[1] + dy];
      let curTileCenter = tileCenter(tile);
      let diff = pointDistFromOrigin(pointSub(curTileCenter, pos));
      if (diff > range) {
        continue;
      }
      const closeness = 1 - diff / range;
      callback(tile, closeness);
    }
  }
};
