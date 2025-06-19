import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import type { AuthContextType } from "../../auth";
import { useAuth } from "../../auth";
import icons from "../../icons.json";

interface FileEntry {
  name: string;
  type: "blob" | "tree";
  oid: string;
}

interface RepositoryData {
  repository: {
    object: {
      entries: FileEntry[];
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
  return (
    <>
      <title>
        {owner}/{repo}
      </title>
      <div className="flex h-screen flex-col items-center justify-center">
        <div className="w-full max-w-2xl px-4">
          <h2 className="text-2xl font-bold mb-4 text-center">
            {owner}/{repo}
          </h2>
          <FileTree owner={owner} name={repo} />
        </div>
      </div>
    </>
  );
}

function FileTree({ owner, name }: { owner: string; name: string }) {
  const once = useRef(false);
  const { tokens } = useAuth();
  const [files, setFiles] = useState<FileEntry[]>([]);

  async function fetchTree() {
    const expr = `HEAD:`;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens!.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `query Repo($owner:String!,$name:String!,$expr:String!){
            repository(owner:$owner,name:$name){
              object(expression:$expr){
                ... on Tree { entries {
                  name type
                  oid: __typename
                }}
              }
            }
          }`,
        variables: { owner, name, expr },
      }),
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status}`);
    }

    const data: { data: RepositoryData } = await response.json();

    if (!data.data.repository?.object?.entries) {
      setFiles([]);
      return;
    }

    setFiles(data.data.repository.object.entries);
  }

  useEffect(() => {
    if (tokens && !once.current) {
      once.current = true;
      fetchTree();
    }
  }, [tokens]);

  const getFileIcon = (name: string, type: string) => {
    if (type === "tree") {
      return icons.tree;
    }
    const extension = name.split(".").pop()?.toLowerCase();
    return extension
      ? icons[extension as keyof typeof icons] || icons.txt
      : icons.txt;
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">file</th>
          </tr>
        </thead>
        <tbody>
          {files.length === 0 ? (
            <tr>
              <td
                colSpan={2}
                className="text-center text-sm text-gray-500 py-4"
              >
                No files found
              </td>
            </tr>
          ) : (
            files.map((file) => (
              <tr key={file.name} className="hover:bg-gray-100">
                <td className="p-0.5">
                  <div className="flex items-center cursor-pointer">
                    <span className="mr-2">
                      {getFileIcon(file.name, file.type)}
                    </span>
                    <span className="text-sm text-gray-500">{file.name}</span>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
