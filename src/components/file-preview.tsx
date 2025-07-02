import { Markdown } from "./markdown";

interface FilePreviewProps {
  filename: string;
  content?: string;
  size?: number;
  isBinary?: boolean;
  owner?: string;
  repo?: string;
}

export function FilePreview({
  filename,
  content,
  size,
  isBinary,
  owner,
  repo,
}: FilePreviewProps) {
  const getFileIcon = (name: string) => {
    const extension = name.startsWith(".")
      ? "dotfile"
      : name.split(".").pop()?.toLowerCase();

    // Import icons dynamically to avoid circular dependency
    const icons = {
      js: "📄",
      ts: "📄",
      jsx: "📄",
      tsx: "📄",
      json: "📄",
      css: "🎨",
      html: "🌐",
      md: "📝",
      txt: "📄",
      py: "🐍",
      java: "☕",
      cpp: "⚙️",
      c: "⚙️",
      h: "⚙️",
      php: "🐘",
      rb: "💎",
      go: "🐹",
      rs: "🦀",
      swift: "🍎",
      kt: "☕",
      scala: "⚡",
      clj: "🍃",
      dotfile: "⚙️",
      tree: "📁",
    };

    return extension ? icons[extension as keyof typeof icons] || "📄" : "📄";
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const isMarkdown = filename.toLowerCase().endsWith(".md");

  const getPreviewContent = () => {
    if (isBinary) {
      return (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📄</div>
          <p className="text-sm text-black/60">Binary file</p>
          <p className="text-xs text-black/40 mt-1">{formatFileSize(size)}</p>
        </div>
      );
    }

    if (!content) {
      return (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">{getFileIcon(filename)}</div>
          <p className="text-sm text-black/60">File preview not available</p>
          <p className="text-xs text-black/40 mt-1">{formatFileSize(size)}</p>
        </div>
      );
    }

    if (isMarkdown && owner && repo) {
      return (
        <Markdown
          filename={filename}
          markdown={content}
          owner={owner}
          repo={repo}
        />
      );
    }

    // Show first 5000 characters for text files
    const preview =
      content.length > 5000 ? content.substring(0, 5000) + "..." : content;

    return (
      <>
        <div className="w-full bg-black/5 mt-6 rounded-lg px-4 py-3">
          <pre className=" w-full   text-xs font-mono text-black/70 overflow-x-auto whitespace-pre-wrap">
            {preview}
          </pre>
        </div>
        {content.length > 5000 && (
          <p className="text-xs text-black/40 text-center">
            Showing first 5,000 characters of {content.length.toLocaleString()}{" "}
            total
          </p>
        )}
      </>
    );
  };

  return getPreviewContent();
}
