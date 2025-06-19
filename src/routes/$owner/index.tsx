import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useAuth, type AuthContextType } from "../../auth";
import { useQuery } from "@tanstack/react-query";

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
      <span className="text-sm text-gray-500">{user?.name}</span>
    </div>
  );
}

function Repositories() {
  const { tokens } = useAuth();
  const { data: repositories = [] } = useQuery({
    queryKey: ["github-repos", tokens?.access_token],
    queryFn: async () => {
      if (!tokens) return [];
      const repositoriesResponse = await fetch(
        "https://api.github.com/user/repos?visibility=all&affiliation=owner,collaborator,organization_member&sort=pushed&per_page=100",
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            Accept: "application/vnd.github+json",
          },
        }
      );
      return repositoriesResponse.json();
    },
    enabled: !!tokens,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <div className="flex flex-col items-center justify-center">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">repository</th>
            <th className="text-right">ID</th>
          </tr>
        </thead>
        <tbody>
          {repositories.map((repository: any) => (
            <tr key={repository.id} className="hover:bg-gray-100">
              <td>
                <Link
                  from="/$owner"
                  key={repository.id}
                  to={`/${repository.owner.login}/${repository.name}`}
                  className="flex p-0.5 items-center justify-between w-full cursor-pointer"
                >
                  <span className="text-sm text-gray-500">
                    {repository.owner.login}/{repository.name}
                  </span>
                </Link>
              </td>
              <td className="text-right p-0.5 text-sm text-gray-500 ">
                {repository.id}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
