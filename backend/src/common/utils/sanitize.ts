import sanitizeHtml from "sanitize-html";

// Rich-text content coming from the CMS editor is sanitized server-side
// before it is ever persisted. Frontend sanitization is not trusted.
const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "u", "s", "blockquote",
  "h1", "h2", "h3", "h4",
  "ul", "ol", "li",
  "a", "img",
  "table", "thead", "tbody", "tr", "th", "td",
  "span", "div", "code", "pre",
];

const ALLOWED_ATTRIBUTES: sanitizeHtml.IOptions["allowedAttributes"] = {
  a: ["href", "target", "rel"],
  img: ["src", "alt", "width", "height"],
  span: ["style"],
  div: ["style"],
  "*": ["class"],
};

export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    // No iframes/scripts/objects/embeds are ever permitted, regardless of input.
    allowedSchemes: ["http", "https", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }),
    },
    exclusiveFilter: (frame) => frame.tag === "script" || frame.tag === "iframe",
  });
}
