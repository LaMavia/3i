import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Provider } from "@/components/ui/provider";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Provider>
        <div className="h-full w-full">
          <div className="p-2 flex gap-2 text-lg">
          </div>
          <hr />
          <Outlet />
        </div>
      </Provider>
    </>
  );
}
