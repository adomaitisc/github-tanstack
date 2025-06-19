import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import type { AuthContextType } from "../../auth";
import { FileTree } from "../../components/file-tree";
import {
  githubFileTreeQueryOptions,
  githubReadmeQueryOptions,
} from "../../queries/github";
import type { QueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth";
import { Markdown } from "../../components/markdown";

export const Route = createFileRoute("/$owner/$repo")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const { owner, repo } = params;
    const ctx = context as { auth: AuthContextType; queryClient: QueryClient };
    if (!ctx.auth.tokens?.access_token) {
      throw redirect({ to: "/" });
    }

    ctx.queryClient.ensureQueryData(
      githubFileTreeQueryOptions(ctx.auth.tokens.access_token, owner, repo)
    );
    ctx.queryClient.ensureQueryData(
      githubReadmeQueryOptions(ctx.auth.tokens.access_token, owner, repo)
    );
  },
  beforeLoad: ({ context }) => {
    const authContext = context as { auth: AuthContextType };
    if (!authContext.auth.isAuthenticated) {
      throw redirect({ to: "/" });
    }
  },
});

function RouteComponent() {
  const { owner, repo } = Route.useParams();
  const { tokens } = useAuth();

  const { data: files = [] } = useQuery(
    githubFileTreeQueryOptions(tokens?.access_token ?? "", owner, repo)
  );
  const { data: readme } = useQuery(
    githubReadmeQueryOptions(tokens?.access_token ?? "", owner, repo)
  );

  return (
    <>
      <title>{`${owner}/${repo}`}</title>
      <div className="flex flex-col items-center justify-start py-[10vh]">
        <div className="w-full max-w-2xl px-4">
          <h2 className="text-2xl font-bold mb-4 text-center">
            {owner}/{repo}
          </h2>
          <FileTree files={files} />
        </div>
        <Markdown
          filename={"README.md"}
          markdown={readme}
          owner={owner}
          repo={repo}
        />
      </div>
    </>
  );
}
