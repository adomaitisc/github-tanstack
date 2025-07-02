import { createFileRoute, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { AuthContextType } from "../../auth";
import { FileTree } from "../../components/file-tree";
import {
  githubFileTreeQueryOptions,
  githubFileContentQueryOptions,
} from "../../queries/github";
import type { QueryClient } from "@tanstack/react-query";
import { useAuth } from "../../auth";
import { FilePreview } from "../../components/file-preview";

export const Route = createFileRoute("/$owner/$")({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    const { owner, _splat } = params;
    const ctx = context as { auth: AuthContextType; queryClient: QueryClient };
    if (!ctx.auth.tokens?.access_token) {
      throw redirect({ to: "/" });
    }

    // Parse the splat to get repo and path
    const splatParts = _splat?.split("/") || [];
    const repo = splatParts[0] || "";
    const path = splatParts.slice(1).join("/") || "";

    if (!repo) {
      throw redirect({ to: "/" });
    }

    const isFile = path && path.includes(".") && !path.endsWith("/");

    if (isFile) {
      ctx.queryClient.ensureQueryData(
        githubFileContentQueryOptions(
          ctx.auth.tokens.access_token,
          owner,
          repo,
          path
        )
      );
    } else {
      ctx.queryClient.ensureQueryData(
        githubFileTreeQueryOptions(
          ctx.auth.tokens.access_token,
          owner,
          repo,
          path
        )
      );
    }

    ctx.queryClient.ensureQueryData(
      githubFileTreeQueryOptions(ctx.auth.tokens.access_token, owner, repo)
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
  const { owner, _splat } = Route.useParams();
  const { tokens } = useAuth();

  // Parse the splat to get repo and path
  const splatParts = _splat?.split("/") || [];
  const repo = splatParts[0] || "";
  const path = splatParts.slice(1).join("/") || "";

  const isFile = path && path.includes(".") && !path.endsWith("/");

  // Always fetch the root file tree for navigation
  const { data: rootFiles = [] } = useQuery(
    githubFileTreeQueryOptions(tokens?.access_token ?? "", owner, repo)
  );
  // Fetch the current directory/file tree
  const { data: currentFiles = [] } = useQuery(
    githubFileTreeQueryOptions(tokens?.access_token ?? "", owner, repo, path)
  );
  // Fetch file content if a file
  const { data: fileContent } = useQuery(
    githubFileContentQueryOptions(tokens?.access_token ?? "", owner, repo, path)
  );
  const displayFiles = path ? currentFiles : rootFiles;

  return (
    <>
      <title>{`${owner}/${repo}${path ? ` - ${path}` : ""}`}</title>
      <div className="flex flex-col items-center justify-start py-[10vh]">
        <div className="w-full max-w-3xl px-4">
          {isFile ? (
            <div className="w-full">
              <FilePreview
                filename={path.split("/").pop() || ""}
                content={fileContent?.content}
                size={fileContent?.size}
                isBinary={fileContent?.isBinary}
                owner={owner}
                repo={repo}
              />
            </div>
          ) : (
            (() => {
              const { tree, preview } = FileTree({
                files: displayFiles,
                owner,
                repo,
                currentPath: path,
                accessToken: tokens?.access_token ?? "",
              });
              return (
                <>
                  {tree}
                  {preview}
                </>
              );
            })()
          )}
        </div>
      </div>
    </>
  );
}
