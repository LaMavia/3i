import * as React from "react";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Provider } from "@/components/ui/provider";
import { Container } from "@chakra-ui/react";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <Provider>
        <div className="h-full w-full">
          <div className="p-2 flex gap-2 text-lg">
            <Link
              to="/"
              activeProps={{
                className: "font-bold",
              }}
              activeOptions={{ exact: true }}
            >
              Home
            </Link>{" "}
            <Link
              to="/about"
              activeProps={{
                className: "font-bold",
              }}
            >
              About
            </Link>
          </div>
          <hr />
          <Outlet />
        </div>
        <TanStackRouterDevtools position="bottom-right" />
      </Provider>
    </>
  );
}
