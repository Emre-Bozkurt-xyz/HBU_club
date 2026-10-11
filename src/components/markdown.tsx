import ReactMarkdown from "react-markdown";

const ALLOWED = [
  "p",
  "a",
  "strong",
  "em",
  "ul",
  "ol",
  "li",
  "blockquote",
  "br",
  "code",
];

/**
 * Renders exec-written Markdown (paragraphs, **bold**, *italic*, [links](url),
 * lists). Raw HTML is never rendered.
 */
export function Markdown({
  children,
  className = "",
  invert = false,
}: {
  children: string | null | undefined;
  className?: string;
  invert?: boolean;
}) {
  if (!children?.trim()) return null;
  return (
    <div className={`prose-hbu ${invert ? "prose-invert" : ""} ${className}`}>
      <ReactMarkdown
        allowedElements={ALLOWED}
        unwrapDisallowed
        components={{
          a: ({ href, children }) => {
            const external = href ? /^https?:\/\//.test(href) : false;
            return (
              <a
                href={href}
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

/** Plain-text excerpt of Markdown, for cards. */
export function excerpt(markdown: string | null | undefined, max = 180) {
  if (!markdown) return "";
  const text = markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/^\s*[-+]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).replace(/\s+\S*$/, "")}…`;
}
