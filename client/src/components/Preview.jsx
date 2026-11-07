import { useMemo } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

export default function Preview({ content }) {
  const html = useMemo(
    () => DOMPurify.sanitize(marked.parse(content || "", { breaks: true })),
    [content]
  );

  return <div className="preview" dangerouslySetInnerHTML={{ __html: html }} />;
}
