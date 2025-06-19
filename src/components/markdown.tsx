import rehypeRaw from "rehype-raw";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ImageMD } from "./image-md";
import { CodeMD } from "./code-md";

interface MarkdownProps {
  filename: string;
  markdown: string | null | undefined;
  owner: string;
  repo: string;
}

export function Markdown({ filename, markdown, owner, repo }: MarkdownProps) {
  if (!markdown) return null;
  return (
    <div className="prose prose-sm max-w-3xl w-full bg-black/5 mt-6 mx-2 rounded-lg px-4 py-3">
      <h2 className="text-sm font-medium mb-3 text-black/90">{filename}</h2>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw]}
        remarkPlugins={[remarkGfm]}
        components={{
          img: (props) => <ImageMD {...props} owner={owner} repo={repo} />,
          code: CodeMD,
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-6 mb-4 text-black/90">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mt-5 mb-3 text-black/90">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mt-4 mb-2 text-black/90">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base font-semibold mt-3 mb-2 text-black/90">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-3 text-black/70 leading-relaxed text-sm">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-3 space-y-1 text-black/70">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1 text-black/70">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-black/70 text-sm">{children}</li>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-emerald-600 hover:text-emerald-800 text-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-black/20 pl-4 italic text-black/60 mb-3">
              {children}
            </blockquote>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-black/90">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-black/80">{children}</em>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
