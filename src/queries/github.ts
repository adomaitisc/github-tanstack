import { queryOptions } from "@tanstack/react-query";

export class NotFoundError extends Error {}

// --- Query Options (exports at the top) ---
export const githubUserQueryOptions = (accessToken: string) =>
  queryOptions({
    queryKey: ["github-user", accessToken],
    queryFn: () => fetchGitHubUser(accessToken),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5,
  });

export const githubRepositoriesQueryOptions = (accessToken: string) =>
  queryOptions({
    queryKey: ["github-repos", accessToken],
    queryFn: () => fetchGitHubRepositories(accessToken),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5,
  });

export const githubFileTreeQueryOptions = (
  accessToken: string,
  owner: string,
  repo: string
) =>
  queryOptions({
    queryKey: ["github-file-tree", owner, repo],
    queryFn: () => fetchGitHubFileTree(accessToken, owner, repo),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5,
  });

export const githubReadmeQueryOptions = (
  accessToken: string,
  owner: string,
  repo: string
) =>
  queryOptions({
    queryKey: ["github-readme", owner, repo],
    queryFn: () => fetchGitHubReadme(accessToken, owner, repo),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5,
  });

// --- Fetch Functions (bottom of file) ---
const fetchGitHubUser = async (accessToken: string) => {
  const res = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch user");
  return res.json();
};

const fetchGitHubRepositories = async (accessToken: string) => {
  const res = await fetch(
    "https://api.github.com/user/repos?visibility=all&affiliation=owner,collaborator,organization_member&sort=pushed&per_page=100",
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch repositories");
  return res.json();
};

const fetchLastCommitForPath = async (
  accessToken: string,
  owner: string,
  repo: string,
  path: string
) => {
  try {
    const commitRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?path=${encodeURIComponent(path)}&per_page=1`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );
    if (commitRes.ok) {
      const commits = await commitRes.json();
      if (commits.length > 0) {
        return {
          lastCommitMessage: commits[0].commit.message,
          lastCommitDate: commits[0].commit.committer.date,
        };
      }
    }
  } catch {}
  return {
    lastCommitMessage: undefined,
    lastCommitDate: undefined,
  };
};

const fetchGitHubFileTree = async (
  accessToken: string,
  owner: string,
  repo: string
) => {
  // 1. Fetch the file tree (blobs and trees)
  const expr = `HEAD:`;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
  if (!res.ok) throw new Error("Failed to fetch file tree");
  const data = await res.json();
  const entries = data.data.repository?.object?.entries || [];

  // 2. Fetch last commit info for each file/folder (blob/tree)
  const filesWithCommits = await Promise.all(
    entries.map(async (entry: any) => {
      const { lastCommitMessage, lastCommitDate } =
        await fetchLastCommitForPath(accessToken, owner, repo, entry.name);
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
};

const possibleReadmeNames = [
  "README.md",
  "readme.md",
  "Readme.md",
  "README.markdown",
  "readme.markdown",
  "README",
  "readme",
];

const fetchGitHubReadme = async (
  accessToken: string,
  owner: string,
  repo: string
) => {
  for (const name of possibleReadmeNames) {
    const expr = `HEAD:${name}`;
    const res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query Repo($owner: String!, $name: String!, $expr: String!) {
            repository(owner: $owner, name: $name) {
              object(expression: $expr) {
                ... on Blob { text }
              }
            }
          }
        `,
        variables: { owner, name: repo, expr },
      }),
    });

    if (!res.ok) continue;
    const data = await res.json();
    const text = data.data.repository?.object?.text;
    if (text) {
      return text;
    }
  }
  return null;
};
