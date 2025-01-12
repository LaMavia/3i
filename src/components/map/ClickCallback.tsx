import { Mode } from "@/types/Mode";
import { Point } from "@/utils/point";
import { LeafletMouseEvent } from "leaflet";
import { Dispatch, SetStateAction } from "react";
import { useMapEvents } from "react-leaflet";

export function ClickCallback({
  callback: setTargetPos,
  setMode,
}: {
  callback: (val: Point) => void;
  setMode: Dispatch<SetStateAction<Mode>>;
}) {
  useMapEvents({
    click: (e: LeafletMouseEvent) => {
      setMode(Mode.Standard);
      setTargetPos([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}
