import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Provider } from "@/components/ui/provider";
import { StateManager } from "@/components/map/StateManager";
import { Menu } from "@/components/gui/Menu";
import { ModeButtons } from "@/components/map/MapButtons";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <StateManager>
        <Provider>
          <div className="h-full w-full overflow-hidden flex-col absolute inset-0">
            <Outlet />
          </div>
          <Menu />
          <ModeButtons />
        </Provider>
      </StateManager>
    </>
  );
}
