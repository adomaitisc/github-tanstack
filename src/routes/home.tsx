import {
  createFileRoute,
  Link,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import { useAuth, type AuthContextType } from "../auth";
import { useQuery } from "@tanstack/react-query";
import {
  githubUserQueryOptions,
  githubRepositoriesQueryOptions,
} from "../queries/github";

export const Route = createFileRoute("/home")({
  component: Home,
  beforeLoad: ({ context }) => {
    const authContext = context as { auth: AuthContextType };
    if (!authContext.auth.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
});

function Home() {
  return (
    <>
      <title>Home</title>
      <div className="flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl px-4">
          <UserInfo />
          <Repositories />
        </div>
      </div>
    </>
  );
}

function UserInfo() {
  const navigate = useNavigate();
  const { logout, tokens } = useAuth();
  const { data: user } = useQuery(
    githubUserQueryOptions(tokens?.access_token ?? "")
  );

  function handleLogout() {
    logout();
    navigate({ to: "/" });
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <img
        src={user?.avatar_url}
        alt="avatar"
        className="w-16 h-16 rounded-full"
      />
      <span className="text-2xl font-bold">{user?.login}</span>
      <span className="text-sm text-black/60">{user?.name}</span>
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full px-6 py-3 text-sm rounded-full bg-black/80 text-white hover:bg-black/90 transition-colors duration-200 font-medium shadow-sm flex items-center justify-center gap-2"
        >
          Logout
        </button>
      </div>
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
      <h2 className="text-2xl font-bold">Repositories</h2>
      <div className="text-sm text-black/60">
        {repositories.map((repository: any) => (
          <Link
            to={`$owner/$repo`}
            params={{ owner: repository.owner.login, repo: repository.name }}
            key={repository.id}
            className="flex items-center justify-between"
          >
            <span className="text-sm text-black/60">{repository.name}</span>
            <span className="text-sm text-black/60">
              {repository.private ? "Private" : "Public"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
