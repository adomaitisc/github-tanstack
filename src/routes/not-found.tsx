import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/not-found")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <>
      <title>Not Found</title>
      <div className="flex h-screen flex-col items-center justify-center">
        <button
          onClick={() => navigate({ to: "/" })}
          className="px-6 py-3 text-sm max-w-max rounded-full bg-black/80 hover:bg-black/90 cursor-pointer text-white transition-colors duration-200 font-medium shadow-sm flex items-center justify-center gap-2"
        >
          Go back home
        </button>
      </div>
    </>
  );
}
