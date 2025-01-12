import { Point } from "@/utils/point";
import { LeafletMouseEvent } from "leaflet";
import { useMapEvents } from "react-leaflet";

export function ClickCallback({
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
