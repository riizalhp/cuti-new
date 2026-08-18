/**
 * Renderer markdown minimal (tanpa dependency) untuk konten FAQ.
 * Mendukung: heading, paragraf, list berurutan/tidak, bold, italic,
 * inline code, code block, link, blockquote, dan horizontal rule.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(text: string): string {
  let t = escapeHtml(text);

  // inline code
  t = t.replace(/`([^`]+)`/g, (_m, code) => `<code class="faq-inline-code">${code}</code>`);

  // links [text](url)
  t = t.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, label, url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer" class="faq-link">${label}</a>`
  );

  // bold **text**
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // italic *text*
  t = t.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");

  return t;
}

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  const closeList = (listType: "ul" | "ol") => out.push(`</${listType}>`);

  while (i < lines.length) {
    const line = lines[i];

    // code block
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      out.push(
        `<pre class="faq-code-block"><code${lang ? ` data-lang="${escapeHtml(lang)}"` : ""}>${escapeHtml(
          codeLines.join("\n")
        )}</code></pre>`
      );
      continue;
    }

    // heading
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const text = renderInline(heading[2]);
      out.push(
        `<h${level} class="faq-heading faq-h${level}" id="${slugify(
          heading[2]
        )}">${text}</h${level}>`
      );
      i++;
      continue;
    }

    // horizontal rule
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      out.push("<hr class=\"faq-hr\" />");
      i++;
      continue;
    }

    // blockquote
    if (line.trim().startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      out.push(`<blockquote class="faq-blockquote">${renderInline(quoteLines.join(" "))}</blockquote>`);
      continue;
    }

    // unordered / ordered list
    const listMatch = line.match(/^\s*([-*+]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const isOl = /^\d+\.$/.test(listMatch[1]);
      const type: "ul" | "ol" = isOl ? "ol" : "ul";
      out.push(`<${type} class="faq-list ${type === "ol" ? "faq-list-ol" : "faq-list-ul"}">`);
      let j = i;
      while (j < lines.length) {
        const lm = lines[j].match(/^\s*([-*+]|\d+\.)\s+(.*)$/);
        if (!lm) break;
        out.push(`<li>${renderInline(lm[2])}</li>`);
        j++;
      }
      closeList(type);
      i = j;
      continue;
    }

    // blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // paragraph (gather consecutive non-special lines)
    const para: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim()) {
      const l = lines[i];
      if (
        /^(#{1,4})\s+/.test(l) ||
        /^\s*```/.test(l) ||
        /^\s*([-*+]|\d+\.)\s+/.test(l) ||
        l.trim().startsWith(">")
      ) {
        break;
      }
      para.push(l);
      i++;
    }
    out.push(`<p class="faq-paragraph">${renderInline(para.join(" "))}</p>`);
  }

  return out.join("\n");
}

/** Strip markdown to plain text (for snippets & chat answers). */
export function markdownToPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)\s]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/^#{1,4}\s+/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^\s*\d+\.\s+/gm, "• ")
    .replace(/^>\s?/gm, "")
    .replace(/[*_]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
