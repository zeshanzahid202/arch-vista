import sanitize from "sanitize-html";
export function cleanHtml(input: string) {
  return sanitize(input, {
    allowedTags: [
      "p",
      "h2",
      "h3",
      "h4",
      "strong",
      "em",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "br",
      "hr",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "title"],
      img: ["src", "alt", "width", "height"],
    },
    allowedSchemes: ["https", "mailto"],
    allowedSchemesByTag: { img: ["https"] },
    transformTags: {
      a: sanitize.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
    exclusiveFilter: (frame) =>
      frame.tag === "img" &&
      !/^https:\/\/(res\.cloudinary\.com|images\.unsplash\.com)\//.test(
        frame.attribs.src || "",
      ),
  });
}
