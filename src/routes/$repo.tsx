import { createFileRoute, redirect } from "@tanstack/react-router";
import type { AuthContextType } from "../auth";

export const Route = createFileRoute("/$repo")({
  component: RouteComponent,
  beforeLoad: ({ context }) => {
    const authContext = context as { auth: AuthContextType };
    if (!authContext.auth.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  const { repo } = Route.useParams();
  return (
    <>
      <title>{repo}</title>
      <div>Hello {repo}!</div>
    </>
  );
}
