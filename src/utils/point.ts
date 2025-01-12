export type Point = [number, number];

export const ratio = 120 / 75;

export const pointAdd = (p1: Point, p2: Point): Point => [
  p1[0] + p2[0],
  p1[1] + p2[1],
];

export const pointSub = (p1: Point, p2: Point): Point => [
  p1[0] - p2[0],
  p1[1] - p2[1],
];

export const pointDistFromOrigin = (p: Point): number =>
  Math.sqrt(ratio * ratio * p[0] * p[0] + p[1] * p[1]);
