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
        className="px-1.5 py-1 bg-black/10 text-black/80 rounded text-[13px] font-mono text-sm"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <pre className="bg-black/5 p-4 rounded-md overflow-x-auto text-sm">
      <code className={className} {...props}>
        {children}
      </code>
    </pre>
  );
}
