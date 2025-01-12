import { cn } from "@/utils/cn";
import { ClassValue } from "clsx";
import { PropsWithChildren } from "react";
import { LG_MENU_WIDTH } from "./Menu";

export const MapOverlay: React.FC<
  PropsWithChildren<{ className?: ClassValue }>
> = ({ className, children }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 w-fit h-fit z-[10000] pointer-events-none [*>&]:pointer-events-auto lg:mx-auto",
        `lg:max-w-[${LG_MENU_WIDTH}]`,
        className,
      )}
    >
      {children}
    </div>
  );
};
