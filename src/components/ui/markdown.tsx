import ReactMarkdown from "react-markdown";

/** Renders editor-written Markdown (news, event, job text). Raw HTML is not rendered. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose-ypf">
      <ReactMarkdown
        components={{
          a: ({ href, children: c }) => (
            <a
              href={href}
              {...(href?.startsWith("http")
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {c}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
