import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { AuthProvider } from "../auth";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  return (
    <AuthProvider>
      <Outlet />
      <TanStackRouterDevtools />
    </AuthProvider>
  );
}
