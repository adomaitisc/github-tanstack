import { icons } from "../icons";
import { formatRelativeDate } from "../utils/date";

export interface FileEntry {
  name: string;
  type: "blob" | "tree";
  oid: string;
  lastCommitMessage?: string;
  lastCommitDate?: string;
}

export function FileTree({ files }: { files: FileEntry[] }) {
  return (
    <div className="flex flex-col items-center justify-center">
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
            files.map((file) => <FileRow key={file.name} file={file} />)
          )}
        </tbody>
      </table>
    </div>
  );
}

function FileRow({ file }: { file: FileEntry }) {
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
  return (
    <tr key={file.name} className="hover:bg-black/5">
      <td className="p-0.5">
        <div className="flex items-center cursor-pointer">
          <span className="mr-1.5 h-auto grid place-items-center">
            {getFileIcon(file.name, file.type)}
          </span>
          <span className="text-sm text-black/60">{file.name}</span>
        </div>
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
