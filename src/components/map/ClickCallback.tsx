import { Mode } from "@/types/Mode";
import { Point } from "@/utils/point";
import { LeafletMouseEvent } from "leaflet";
import { useContext } from "react";
import { useMapEvents } from "react-leaflet";
import { StateContext } from "./StateManager";

export function ClickCallback({
  callback: setTargetPos,
}: {
  callback: (val: Point) => void;
}) {
  const { setState } = useContext(StateContext);
  useMapEvents({
    click: (e: LeafletMouseEvent) => {
      setState?.((s) => ({ ...s, mode: Mode.Standard }));
      setTargetPos([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}
