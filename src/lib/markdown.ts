import { marked } from "marked";

marked.setOptions({ breaks: true, gfm: true });

/**
 * Converts AI-generated markdown (**bold**, # headings, lists, etc.) into
 * real HTML. Section content already saved as HTML (from manual editing in
 * the rich text editor) is passed through untouched — the heuristic is the
 * same one the editor already used: real HTML content starts with a tag.
 */
export function markdownToHtml(text: string): string {
  if (!text || !text.trim()) return "";
  if (text.trimStart().startsWith("<")) return text;
  return marked.parse(text, { async: false }) as string;
}

/**
 * Strips a single leading heading (any level) from HTML if its text matches
 * the given title (case-insensitive, whitespace-normalized). AI-generated
 * section content sometimes repeats the section title as its own first
 * heading, duplicating the title the caller already renders separately.
 */
export function stripLeadingDuplicateTitle(html: string, title: string): string {
  const normalizedTitle = title.trim().toLowerCase();
  if (!normalizedTitle) return html;

  return html.replace(
    /^\s*<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i,
    (match, inner: string) => {
      const headingText = inner.replace(/<[^>]+>/g, "").trim().toLowerCase();
      return headingText === normalizedTitle ? "" : match;
    }
  );
}
