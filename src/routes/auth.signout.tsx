import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../auth";

export const Route = createFileRoute("/auth/signout")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  logout();
  navigate({ to: "/", replace: true });
}
