import { icons } from "../icons";
import { formatRelativeDate } from "../utils/date";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { githubFileContentQueryOptions } from "../queries/github";
import { FilePreview } from "./file-preview";

export interface FileEntry {
  name: string;
  type: "blob" | "tree";
  oid: string;
  lastCommitMessage?: string;
  lastCommitDate?: string;
}

export interface FileTreeProps {
  files: FileEntry[];
  owner: string;
  repo: string;
  currentPath?: string;
  accessToken: string;
}

export interface FileTreeResult {
  tree: React.ReactNode;
  preview?: React.ReactNode;
}

export function FileTree({
  files,
  owner,
  repo,
  currentPath,
  accessToken,
}: FileTreeProps): FileTreeResult {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Clear selected file when navigating to a different folder
  useEffect(() => {
    setSelectedFile(null);
  }, [currentPath]);

  const getBreadcrumbPath = (path?: string) => {
    if (!path) return "";
    return path.startsWith("/") ? path.substring(1) : path;
  };

  const getPathSegments = (path?: string) => {
    if (!path) return [];
    return path.split("/").filter((segment) => segment.length > 0);
  };

  const breadcrumbPath = getBreadcrumbPath(currentPath);
  const pathSegments = getPathSegments(breadcrumbPath);

  // Query for selected file content
  const { data: fileContent } = useQuery(
    githubFileContentQueryOptions(accessToken, owner, repo, selectedFile || "")
  );

  const handleFileClick = (filePath: string) => {
    setSelectedFile(selectedFile === filePath ? null : filePath);
  };

  const tree = (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Breadcrumb navigation */}
      <div className="w-full mb-4 flex items-center gap-2 text-sm">
        <Link
          to="/$owner"
          params={{ owner }}
          className="text-emerald-600 hover:text-emerald-800"
        >
          {owner}
        </Link>
        <span className="text-black/40">/</span>
        <Link
          to="/$owner/$"
          params={{ owner, _splat: repo }}
          className="text-emerald-600 hover:text-emerald-800"
        >
          {repo}
        </Link>
        {pathSegments.map((segment, index) => {
          const segmentPath = pathSegments.slice(0, index + 1).join("/");
          return (
            <span key={index} className="flex items-center gap-2">
              <span className="text-black/40">/</span>
              <Link
                to="/$owner/$"
                params={{
                  owner,
                  _splat: `${repo}/${segmentPath}`,
                }}
                className="text-emerald-600 hover:text-emerald-800"
              >
                {segment}
              </Link>
            </span>
          );
        })}
      </div>

      {/* File Tree */}
      <table className="w-full">
        <thead className="text-sm text-black/70">
          <tr>
            <th className="text-left font-medium text-xs">File</th>
            <th className="text-left font-medium text-xs">Last Commit</th>
            <th className="text-right font-medium text-xs">Date</th>
          </tr>
        </thead>
        <tbody>
          {files.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="text-center text-sm text-black/60 py-4"
              >
                No files found
              </td>
            </tr>
          ) : (
            files.map((file) => (
              <FileRow
                key={file.name}
                file={file}
                owner={owner}
                repo={repo}
                currentPath={currentPath}
                onFileClick={handleFileClick}
                isSelected={
                  selectedFile ===
                  (currentPath ? `${currentPath}/${file.name}` : file.name)
                }
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  const preview = selectedFile ? (
    <FilePreview
      filename={selectedFile.split("/").pop() || ""}
      content={fileContent?.content}
      size={fileContent?.size}
      isBinary={fileContent?.isBinary}
      owner={owner}
      repo={repo}
    />
  ) : undefined;

  return { tree, preview };
}

function FileRow({
  file,
  owner,
  repo,
  currentPath,
  onFileClick,
  isSelected,
}: {
  file: FileEntry;
  owner: string;
  repo: string;
  currentPath?: string;
  onFileClick: (filePath: string) => void;
  isSelected: boolean;
}) {
  const getFileIcon = (name: string, type: string) => {
    if (type === "tree") {
      return icons.tree;
    }
    const extension = name.startsWith(".")
      ? "dotfile"
      : name.split(".").pop()?.toLowerCase();
    return extension
      ? icons[extension as keyof typeof icons] || icons.tree
      : icons.tree;
  };

  const getFilePath = () => {
    if (!currentPath) return file.name;
    return `${currentPath}/${file.name}`;
  };

  const filePath = getFilePath();

  const handleClick = (e: React.MouseEvent) => {
    if (file.type === "blob") {
      e.preventDefault();
      onFileClick(filePath);
    }
  };

  return (
    <tr
      key={file.name}
      className={`hover:bg-black/5 ${isSelected ? "bg-black/10" : ""}`}
    >
      <td className="p-0.5">
        <Link
          to="/$owner/$"
          params={{
            owner,
            _splat: `${repo}/${filePath}`,
          }}
          className="flex items-center cursor-pointer w-full"
          onClick={handleClick}
        >
          <span className="mr-1.5 h-auto grid place-items-center">
            {getFileIcon(file.name, file.type)}
          </span>
          <span className="text-sm text-black/60">{file.name}</span>
        </Link>
      </td>
      <td className="p-0.5 text-sm text-black/50 max-w-[200px] truncate">
        {file.lastCommitMessage || "-"}
      </td>
      <td className="p-0.5 text-sm text-right text-black/50">
        {file.lastCommitDate ? formatRelativeDate(file.lastCommitDate) : "-"}
      </td>
    </tr>
  );
}
