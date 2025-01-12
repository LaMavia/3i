import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Provider } from "@/components/ui/provider";
import { StateManager } from "@/components/map/StateManager";
import { Menu } from "@/components/gui/Menu";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <StateManager>
        <Provider>
          <div className="h-full w-full overflow-hidden flex-col">
            <Outlet />
            <Menu />
          </div>
        </Provider>
      </StateManager>
    </>
  );
}
