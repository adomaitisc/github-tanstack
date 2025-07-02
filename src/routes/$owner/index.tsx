import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useAuth, type AuthContextType } from "../../auth";
import { useQuery } from "@tanstack/react-query";
import { githubRepositoriesQueryOptions } from "../../queries/github";
import { useState, useRef, useEffect } from "react";

export const Route = createFileRoute("/$owner/")({
  component: Owner,
  beforeLoad: ({ context, params }) => {
    const authContext = context as { auth: AuthContextType };
    if (!authContext.auth.isAuthenticated) {
      throw redirect({ to: "/" });
    } else if (params.owner !== authContext.auth.user?.login) {
      throw redirect({ to: "/not-found" });
    }
  },
});

function Owner() {
  const { user } = useAuth();
  return (
    <>
      <title>{user?.login}</title>
      <div className="flex h-screen flex-col items-center justify-start py-[10vh]">
        <div className="w-full max-w-3xl px-4">
          <UserInfo />
          <Repositories />
        </div>
      </div>
    </>
  );
}

function UserInfo() {
  const { user } = useAuth();
  return (
    <div className="w-full mb-4 flex items-center gap-2 text-sm">
      <span className="text-emerald-600 hover:text-emerald-800 shrink-0">
        {user?.login}
      </span>
      <span className="text-black/40 shrink-0">/</span>
      <span className="text-sm text-black/60 shrink-0">{user?.name}</span>
      <ExpandingSearchInput />
    </div>
  );
}

function ExpandingSearchInput() {
  const [value, setValue] = useState("");
  const [width, setWidth] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const spanRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const placeholder = "Search...";
  const minWidth = 80; // Minimum width in pixels

  // Show arrow if value has at least 5 characters
  const showArrow = value.length >= 5;

  useEffect(() => {
    if (spanRef.current && containerRef.current) {
      spanRef.current.textContent = value || placeholder;
      const measuredWidth = spanRef.current.offsetWidth + 20;
      const containerWidth = containerRef.current.offsetWidth;
      const newWidth = Math.max(
        minWidth,
        Math.min(measuredWidth, containerWidth)
      );
      setWidth(newWidth);
    }
  }, [value, placeholder, minWidth]);

  return (
    <div
      ref={containerRef}
      className="ml-auto relative flex-1 overflow-hidden flex justify-end "
    >
      {/* Hidden span to measure text width */}
      <span
        ref={spanRef}
        className="text-sm invisible absolute whitespace-pre"
        style={{ font: "inherit" }}
      >
        {placeholder}
      </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={`text-sm text-black/60 bg-transparent focus:outline-none transition-all`}
        style={{ width: `${width}px` }}
      />
      <span
        className={`cursor-pointer hover:bg-blue-500 size-5 grid place-items-center hover:text-white rounded-full text-blue-500 select-none hover:stroke-3 ${
          showArrow
            ? "opacity-100 pointer-events-auto"
            : "opacity-50 pointer-events-none"
        }`}
      >
        &#8594;
      </span>
    </div>
  );
}

function Repositories() {
  const { tokens } = useAuth();
  const { data: repositories = [] } = useQuery(
    githubRepositoriesQueryOptions(tokens?.access_token ?? "")
  );

  return (
    <div className="flex flex-col items-center justify-center">
      <table className="w-full">
        <thead className="text-sm text-black/70">
          <tr>
            <th className="text-left font-medium text-xs">Repository</th>
            <th className="text-left font-medium text-xs">Description</th>
            <th className="text-right font-medium text-xs">Stars</th>
          </tr>
        </thead>
        <tbody>
          {repositories.map((repository: any) => (
            <tr key={repository.id} className="hover:bg-black/5">
              <td>
                <Link
                  from="/$owner"
                  key={repository.id}
                  to={`/${repository.full_name}`}
                  className="flex p-0.5 items-center justify-between w-full cursor-pointer"
                >
                  <span className="text-sm text-black/70">
                    {repository.full_name}
                  </span>
                </Link>
              </td>
              <td className="text-right p-0.5 truncate max-w-[200px] text-sm text-black/50 ">
                {repository.description}
              </td>
              <td className="text-right p-0.5 text-sm text-black/50 ">
                {repository.stargazers_count}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
