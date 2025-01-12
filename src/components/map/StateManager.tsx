import { Mode } from "@/types/Mode";
import { PropsWithChildren, createContext, useState } from "react";

export type State = {
  pos: [number, number];
  targetPos: [number, number];
  line: [number, number][];
  path: [number, number][];
  mode: Mode;
};

export type SetState = React.Dispatch<React.SetStateAction<State>>;

export const StateContext = createContext<{
  state?: State;
  setState?: SetState;
}>({});

export const StateManager: React.FC<PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState<State>({
    pos: [52.21126, 20.98183],
    targetPos: [52.21126, 20.98183],
    line: [],
    path: [],
    mode: Mode.Standard,
  });

  return (
    <StateContext.Provider
      value={{
        state,
        setState,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};
