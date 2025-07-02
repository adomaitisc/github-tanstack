import { useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../auth";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallback,
});

function AuthCallback() {
  const once = useRef(false);
  const navigate = useNavigate();
  const { exchangeCode } = useAuth();
  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get("code");

  useEffect(() => {
    if (code && !once.current) {
      once.current = true;
      exchangeCode(code).then((success) => {
        if (success) {
          navigate({ to: "/" });
        }
      });
    }
  }, [code, exchangeCode, navigate, once]);

  return (
    <>
      <title>Auth Callback</title>
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="px-6 py-3 text-sm max-w-max rounded-full bg-black/60 text-white transition-colors duration-200 font-medium shadow-sm flex items-center justify-center gap-2">
          Hang on as we complete the process...
        </div>
      </div>
    </>
  );
}
