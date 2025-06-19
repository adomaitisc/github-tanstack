import { queryOptions } from "@tanstack/react-query";

export class NotFoundError extends Error {}

// User info
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

export const githubUserQueryOptions = (accessToken: string) =>
  queryOptions({
    queryKey: ["github-user", accessToken],
    queryFn: () => fetchGitHubUser(accessToken),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5,
  });

// User repositories
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

export const githubRepositoriesQueryOptions = (accessToken: string) =>
  queryOptions({
    queryKey: ["github-repos", accessToken],
    queryFn: () => fetchGitHubRepositories(accessToken),
    enabled: !!accessToken,
    staleTime: 1000 * 60 * 5,
  });

// File tree with commit info
const fetchGitHubFileTree = async (
  accessToken: string,
  owner: string,
  repo: string
) => {
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

  // Get commit info for each file using REST API
  const filesWithCommits = await Promise.all(
    entries.map(async (entry: any) => {
      let lastCommitMessage = undefined;
      let lastCommitDate = undefined;
      if (entry.type === "blob") {
        try {
          const commitRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/commits?path=${entry.name}&per_page=1`,
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
              lastCommitMessage = commits[0].commit.message;
              lastCommitDate = commits[0].commit.committer.date;
            }
          }
        } catch {}
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
};

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

// README
const fetchGitHubReadme = async (
  accessToken: string,
  owner: string,
  repo: string
) => {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
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
  if (!res.ok) return null;
  const data = await res.json();
  return data.data.repository?.object?.text || null;
};

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
