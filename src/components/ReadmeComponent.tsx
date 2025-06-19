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
    <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{filename}</h3>
      <div className="prose prose-sm prose-gray max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: (props) => <ImageMD {...props} owner={owner} repo={repo} />,
            code: CodeMD,
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-bold mt-4 mb-2 text-gray-900">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-3 text-gray-700 leading-relaxed text-sm">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="text-gray-700">{children}</li>,
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
              <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-600 mb-3">
                {children}
              </blockquote>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-gray-900">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-gray-800">{children}</em>
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
