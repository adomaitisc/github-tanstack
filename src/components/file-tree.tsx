import icons from "../icons.json";

export interface FileEntry {
  name: string;
  type: "blob" | "tree";
  oid: string;
  lastCommitMessage?: string;
  lastCommitDate?: string;
}

export function FileTree({ files }: { files: FileEntry[] }) {
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
            <th className="text-left">last commit</th>
            <th className="text-left">date</th>
          </tr>
        </thead>
        <tbody>
          {files.length === 0 ? (
            <tr>
              <td
                colSpan={3}
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
                <td className="p-0.5 text-sm text-gray-600 max-w-[200px] truncate">
                  {file.lastCommitMessage || "-"}
                </td>
                <td className="p-0.5 text-sm text-gray-400">
                  {file.lastCommitDate
                    ? new Date(file.lastCommitDate).toLocaleString()
                    : "-"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
