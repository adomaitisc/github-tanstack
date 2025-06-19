import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "../auth";

export const Route = createFileRoute("/not-found")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useAuth();
  return (
    <>
      <title>Not Found</title>
      <div className="flex h-screen flex-col items-center justify-center">
        <Link
          to={`/${user?.login}`}
          className="px-6 py-3 text-sm max-w-max rounded-full bg-gray-800 hover:bg-gray-900 cursor-pointer text-white transition-colors duration-200 font-medium shadow-sm flex items-center justify-center gap-2"
        >
          Go back to the home page
        </Link>
      </div>
    </>
  );
}
