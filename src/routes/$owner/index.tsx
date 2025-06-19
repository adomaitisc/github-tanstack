import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useAuth, type AuthContextType } from "../../auth";
import { useQuery } from "@tanstack/react-query";
import { githubRepositoriesQueryOptions } from "../../queries/github";

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
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="w-full max-w-2xl px-4">
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
    <div className="flex flex-col items-center justify-center">
      <img
        src={user?.avatar_url}
        alt="avatar"
        className="w-16 h-16 rounded-full"
      />
      <span className="text-2xl font-bold">{user?.login}</span>
      <span className="text-sm text-black/60">{user?.name}</span>
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
            <th className="text-left">Repository</th>
            <th className="text-right">ID</th>
          </tr>
        </thead>
        <tbody>
          {repositories.map((repository: any) => (
            <tr key={repository.id} className="hover:bg-black/5">
              <td>
                <Link
                  from="/$owner"
                  key={repository.id}
                  to={`/${repository.owner.login}/${repository.name}`}
                  className="flex p-0.5 items-center justify-between w-full cursor-pointer"
                >
                  <span className="text-sm text-black/70">
                    {repository.owner.login}/{repository.name}
                  </span>
                </Link>
              </td>
              <td className="text-right p-0.5 text-sm text-black/50 ">
                {repository.id}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
