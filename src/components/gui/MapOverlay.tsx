import { cn } from "@/utils/cn";
import { ClassValue } from "clsx";
import { PropsWithChildren } from "react";

export const MapOverlay: React.FC<
  PropsWithChildren<{ className?: ClassValue }>
> = ({ className, children }) => {
  return (
    <div
      className={cn(
        "absolute inset-0 w-fit h-fit z-[10000] pointer-events-none [*>&]:pointer-events-auto",
        className,
      )}
    >
      {children}
    </div>
  );
};
