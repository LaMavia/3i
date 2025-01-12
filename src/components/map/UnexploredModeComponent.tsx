import { Point, pointAdd } from "@/utils/point";
import { useContext } from "react";
import { StateContext } from "./StateManager";
import { forTileInRange, tileCorner } from "@/utils/tile";
import { Polygon } from "react-leaflet";

const MAX_DIST = 0.05;

export function UnexploredModeComponent() {
  const { state, setState } = useContext(StateContext);
  const pointToId = (p: Point) => p[0] + "_" + p[1];

  let explored = new Map<String, number>([]);
  let rects: [Point, Point, number][] = [];

  state?.line.forEach((p) => {
    forTileInRange(p, 0.0014, (t, closeness) => {
      let t_id = pointToId(t);
      closeness = Math.min(closeness * 2, 1);
      let prevDist = explored.get(t_id);
      if (prevDist === undefined) {
        prevDist = 0;
      }
      if (prevDist < closeness) {
        explored.set(t_id, closeness);
      }
    });
  });

  if (state !== undefined) {
    forTileInRange(state.pos, MAX_DIST, (tile, closeness) => {
      let dist = explored.get(pointToId(tile));
      if (dist === undefined) {
        dist = 0;
      }
      if (dist > 0.8) {
        return;
      }
      rects.push([
        tileCorner(tile),
        tileCorner(pointAdd(tile, [1, 1])),
        Math.min(closeness, 1 - dist),
      ]);
    });
  }

  // rects = rects.filter(([_1, _2, closeness]) => closeness < 0.5)

  let polygon = rects.map(([p1, p2, _]): Point[][] => {
    return [[p1, [p1[0], p2[1]], p2, [p2[0], p1[1]]]];
  });

  return <Polygon positions={polygon} fillOpacity={0.6} stroke={false} />;

  /*return (<>{rects.map(([p1, p2, closeness]) => 
    <Rectangle bounds={[p1, p2]} stroke={false} fillOpacity={0.8*Math.pow(closeness, 0.6)}/>
  )}</>)*/
}
