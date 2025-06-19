import { createFileRoute, redirect } from "@tanstack/react-router";

import type { AuthContextType } from "../../auth";
import { useAuth } from "../../auth";
import { useQuery } from "@tanstack/react-query";
import { Markdown } from "../../components/ReadmeComponent";
import { FileTree } from "../../components/file-tree";

interface ReadmeData {
  repository: {
    object: {
      text: string;
    };
  };
}

export const Route = createFileRoute("/$owner/$repo")({
  component: RouteComponent,
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

  const { data: files = [] } = useQuery({
    queryKey: ["github-file-tree", owner, repo],
    queryFn: async () => {
      if (!tokens) return [];
      const expr = `HEAD:`;
      const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `query Repo($owner:String!,$name:String!,$expr:String!){
            repository(owner:$owner,name:$name){
              object(expression:$expr){
                ... on Tree { entries {
                  name type oid
                }}
              }
            }
          }`,
          variables: { owner, name: repo, expr },
        }),
      });
      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.status}`);
      }
      const data = await response.json();
      const entries = data.data.repository?.object?.entries || [];

      // Get commit info for each file using REST API
      const filesWithCommits = await Promise.all(
        entries.map(async (entry: any) => {
          let lastCommitMessage = undefined;
          let lastCommitDate = undefined;

          if (entry.type === "blob") {
            try {
              const commitResponse = await fetch(
                `https://api.github.com/repos/${owner}/${repo}/commits?path=${entry.name}&per_page=1`,
                {
                  headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                    Accept: "application/vnd.github+json",
                  },
                }
              );
              if (commitResponse.ok) {
                const commits = await commitResponse.json();
                if (commits.length > 0) {
                  lastCommitMessage = commits[0].commit.message;
                  lastCommitDate = commits[0].commit.committer.date;
                }
              }
            } catch (error) {
              console.error(
                `Failed to get commit info for ${entry.name}:`,
                error
              );
            }
          }

          return {
            name: entry.name,
            type: entry.type,
            oid: entry.oid,
            lastCommitMessage,
            lastCommitDate,
          };
        })
      );

      return filesWithCommits;
    },
    enabled: !!tokens,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: readme } = useQuery({
    queryKey: ["github-readme", owner, repo],
    queryFn: async () => {
      if (!tokens) return null;
      const response = await fetch("https://api.github.com/graphql", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `query Repo($owner:String!,$name:String!){
            repository(owner:$owner,name:$name){
              object(expression:"HEAD:README.md"){
                ... on Blob { text }
              }
            }
          }`,
          variables: { owner, name: repo },
        }),
      });
      if (!response.ok) {
        return null;
      }
      const data: { data: ReadmeData } = await response.json();
      return data.data.repository?.object?.text || null;
    },
    enabled: !!tokens,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return (
    <>
      <title>{`${owner}/${repo}`}</title>
      <div className="flex flex-col items-center justify-start py-[10vh]">
        <div className="w-full max-w-2xl px-4">
          <h2 className="text-2xl font-bold mb-4 text-center">
            {owner}/{repo}
          </h2>
          <FileTree files={files} />
          <Markdown
            filename={"README.md"}
            markdown={readme}
            owner={owner}
            repo={repo}
          />
        </div>
      </div>
    </>
  );
}
