import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "../auth";
import { useEffect, useRef, useState } from "react";

export const Route = createFileRoute("/home")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: "/" });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl px-4">
        <UserInfo />
        <Repositories />
      </div>
    </div>
  );
}

function UserInfo() {
  const once = useRef(false);
  const { tokens, logout } = useAuth();
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (tokens && !once.current) {
        once.current = true;
        const userResponse = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            Accept: "application/vnd.github+json",
          },
        });
        const user = await userResponse.json();
        setUser(user);
      }
    };
    fetchUser();
  }, [tokens, once]);

  return (
    <div className="flex flex-col items-center justify-center">
      <img
        src={user?.avatar_url}
        alt="avatar"
        className="w-16 h-16 rounded-full"
      />
      <div className="text-2xl font-bold">{user?.login}</div>
      <div className="text-sm text-gray-500">{user?.name}</div>
      <div className="p-4">
        <button
          onClick={logout}
          className="w-full px-6 py-3 text-sm rounded-full bg-gray-800 text-white hover:bg-gray-900 transition-colors duration-200 font-medium shadow-sm flex items-center justify-center gap-2"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function Repositories() {
  const once = useRef(false);
  const { tokens } = useAuth();
  const [repositories, setRepositories] = useState<any[]>([]);

  useEffect(() => {
    const fetchRepositories = async () => {
      if (tokens && !once.current) {
        once.current = true;
        const repositoriesResponse = await fetch(
          "https://api.github.com/user/repos?visibility=all&affiliation=owner,collaborator,organization_member&sort=pushed&per_page=100",
          {
            headers: {
              Authorization: `Bearer ${tokens!.access_token}`,
              Accept: "application/vnd.github+json",
            },
          }
        );
        const repositories = await repositoriesResponse.json();
        setRepositories(repositories);
      }
    };
    fetchRepositories();
  }, [tokens]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="text-2xl font-bold">Repositories</div>
      <div className="text-sm text-gray-500">
        {repositories.map((repository) => (
          <div
            key={repository.id}
            className="flex items-center justify-between"
          >
            <p className="text-sm text-gray-500">{repository.name}</p>
            <p className="text-sm text-gray-500">
              {repository.private ? "Private" : "Public"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
