import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get("code");

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">
          Completing Authentication...
        </h1>
        <p className="text-gray-600">
          Please wait while we complete the process.
        </p>
      </div>
    </div>
  );
}
