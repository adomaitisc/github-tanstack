interface ImageMDProps {
  src?: string;
  alt?: string;
  owner: string;
  repo: string;
}

export function ImageMD({ src, alt, owner, repo }: ImageMDProps) {
  if (!src) return null;

  // Handle relative paths by prepending GitHub raw content URL
  const imageUrl = src.startsWith("https")
    ? src + "?raw=true"
    : `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${src}`;

  return (
    <img
      src={imageUrl}
      alt={alt || ""}
      className="max-w-full h-auto rounded"
      loading="lazy"
      onError={(e) => {
        // Fallback for broken images
        e.currentTarget.style.display = "none";
      }}
      onLoad={(e) => {
        // Ensure GIFs animate properly
        const img = e.currentTarget;
        if (img.src.toLowerCase().endsWith(".gif")) {
          img.style.display = "block";
        }
      }}
    />
  );
}
