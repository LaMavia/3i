import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Provider } from "@/components/ui/provider";
import { StateManager } from "@/components/map/StateManager";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <StateManager>
        <Provider>
          <div className="h-full w-full">
            <div className="p-2 flex gap-2 text-lg"></div>
            <hr />
            <Outlet />
          </div>
        </Provider>
      </StateManager>
    </>
  );
}
