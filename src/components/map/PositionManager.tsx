import { useContext, useEffect, useRef } from "react";
import { StateContext } from "./StateManager";
import { pointDistFromOrigin, pointSub } from "@/utils/point";

const SPEED = 0.009;
const MIN_DIST_FOR_POINT = 0.0001;

export const PositionManager = () => {
  const { setState } = useContext(StateContext);

  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  const update = (time: number) => {
    if (previousTimeRef.current !== undefined) {
      const dt = (time - previousTimeRef.current) / 1000;
      // @ts-ignore
      setState?.((state) => {
        const { pos, targetPos, line } = state;
        const diff = pointSub(targetPos, pos);
        const diffLen = pointDistFromOrigin(diff);

        let nextPos: [number, number];

        if (targetPos[0] == pos[0] && targetPos[1] == pos[1]) {
          nextPos = pos;
        } else if (diffLen <= Math.max(dt, 0.0001) * SPEED) {
          nextPos = targetPos;
        } else {
          const scale = (dt * SPEED) / diffLen;
          nextPos = [pos[0] + diff[0] * scale, pos[1] + diff[1] * scale];
        }

        let nextLines = line;
        if (line.length > 0) {
          const last_point = line[line.length - 1];
          const nextPointDiff = pointDistFromOrigin(pointSub(last_point, pos));
          if (nextPointDiff > MIN_DIST_FOR_POINT) {
            nextLines = line.concat([pos]);
          }
        } else {
          nextLines = [pos];
        }

        return { ...state, pos: nextPos, line: nextLines };
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

  return null;
};
