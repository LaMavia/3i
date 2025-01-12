import { ReactNode, useContext } from "react";
import { StateContext } from "../map/StateManager";
import { Mode } from "@/types/Mode";
import { Icon, Text, VStack } from "@chakra-ui/react";
import { PiGpsBold, PiPathBold, PiMapTrifoldBold } from "react-icons/pi";
import { cn } from "@/utils/cn";

export const MENU_HEIGHT = "72px";
export const LG_MENU_HEIGHT = "54px";
export const LG_MENU_WIDTH = "600px";

const MENU_ITEMS = [
  {
    mode: Mode.SelectPath,
    label: "path",
    icon: <PiPathBold />,
  },
  {
    mode: Mode.Standard,
    label: "standard",
    icon: <PiGpsBold />,
  },
  {
    mode: Mode.Unexplored,
    label: "unexplored",
    icon: <PiMapTrifoldBold />,
  },
] satisfies { mode: Mode; label: string; icon: ReactNode }[];

export const Menu = () => {
  const { state, setState } = useContext(StateContext);

  return (
    <div
      className={`absolute inset-x-0 mx-auto bottom-0 w-full z-[10000] lg:h-[${LG_MENU_HEIGHT}] h-[${MENU_HEIGHT}] bg-gray-900 lg:w-[${LG_MENU_WIDTH}]`}
    >
      <div className="flex flex-row justify-center items-center w-full h-full">
        {MENU_ITEMS.map(({ icon, label, mode }) => (
          <button
            className={cn(
              "flex-grow flex-shrink-0 h-full",
              state?.mode === mode ? "text-gray-50" : "text-gray-500",
            )}
            onClick={() => {
              setState?.((s) => ({ ...s, mode }));
            }}
          >
            <VStack className="h-full items-center justify-center">
              <Icon size="md">{icon}</Icon>
              <Text textTransform="uppercase" textStyle="2xs">
                {label}
              </Text>
            </VStack>
          </button>
        ))}
      </div>
    </div>
  );
};
