interface CodeMDProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function CodeMD({
  node,
  inline,
  className,
  children,
  ...props
}: CodeMDProps) {
  if (!className) {
    return (
      <code
        className="px-1.5 py-1 bg-gray-200 text-gray-800 rounded text-[13px] font-mono text-sm"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
      <code className={className} {...props}>
        {children}
      </code>
    </pre>
  );
}
