'use client';

import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Render inline text containing KaTeX math ($...$), bold (**...**), italic (*...*),
 * inline code (`...`), and links ([...](...)).
 */
function renderInlineText(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let keyIndex = 0;

  // Regex to match inline elements:
  // 1. Math: \$([^$]+)\$
  // 2. Code: `([^`]+)`
  // 3. Bold: \*\*([^*]+)\*\*
  // 4. Italic: \*([^*]+)\*
  // 5. Link: \[([^\]]+)\]\(([^)]+)\)
  const inlineRegex = /(\$[^$]+\$|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

  const parts = text.split(inlineRegex);

  for (const part of parts) {
    if (!part) continue;

    if (part.startsWith('$') && part.endsWith('$') && part.length >= 2) {
      const mathExpr = part.slice(1, -1);
      try {
        const renderedMath = katex.renderToString(mathExpr, {
          displayMode: false,
          throwOnError: false,
        });
        nodes.push(
          <span
            key={`math-${keyIndex++}`}
            className="inline-math px-1 py-0.5 text-blue-300 dark:text-blue-300 font-medium"
            dangerouslySetInnerHTML={{ __html: renderedMath }}
          />
        );
      } catch {
        nodes.push(<span key={`math-err-${keyIndex++}`}>{part}</span>);
      }
    } else if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      const code = part.slice(1, -1);
      nodes.push(
        <code
          key={`code-${keyIndex++}`}
          className="px-1.5 py-0.5 mx-0.5 rounded-[4px] bg-slate-800 text-amber-300 font-mono text-[0.85em] border border-slate-700/80"
        >
          {code}
        </code>
      );
    } else if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const boldText = part.slice(2, -2);
      nodes.push(
        <strong key={`bold-${keyIndex++}`} className="font-bold text-white">
          {renderInlineText(boldText)}
        </strong>
      );
    } else if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
      const italicText = part.slice(1, -1);
      nodes.push(
        <em key={`italic-${keyIndex++}`} className="italic text-slate-300">
          {renderInlineText(italicText)}
        </em>
      );
    } else if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
      const match = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (match) {
        const [, linkText, href] = match;
        nodes.push(
          <a
            key={`link-${keyIndex++}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cobalt-400 hover:text-cobalt-300 underline font-medium underline-offset-2"
          >
            {linkText}
          </a>
        );
      } else {
        nodes.push(<span key={`text-${keyIndex++}`}>{part}</span>);
      }
    } else {
      nodes.push(<span key={`text-${keyIndex++}`}>{part}</span>);
    }
  }

  return nodes;
}

export function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  if (!content) return null;

  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let blockKey = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 1. Empty line
    if (!trimmed) {
      i++;
      continue;
    }

    // 2. Multiline Math Block: $$ ... $$ or single line $$...$$
    if (trimmed.startsWith('$$')) {
      let mathExpr = '';
      if (trimmed.endsWith('$$') && trimmed.length > 2 && trimmed !== '$$') {
        // Single line math block: "$$formula$$"
        mathExpr = trimmed.slice(2, -2).trim();
        i++;
      } else {
        // Multiline math block
        const mathLines: string[] = [];
        if (trimmed.length > 2) {
          mathLines.push(trimmed.slice(2));
        }
        i++;
        while (i < lines.length && !lines[i].trim().endsWith('$$')) {
          mathLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) {
          const lastLine = lines[i].trim();
          if (lastLine !== '$$') {
            mathLines.push(lastLine.slice(0, -2));
          }
          i++;
        }
        mathExpr = mathLines.join('\n').trim();
      }

      try {
        const renderedMath = katex.renderToString(mathExpr, {
          displayMode: true,
          throwOnError: false,
        });
        blocks.push(
          <div
            key={`mathblock-${blockKey++}`}
            className="my-4 py-3 px-4 sm:px-6 bg-slate-900/90 border border-slate-800/90 rounded-[10px] overflow-x-auto shadow-inner text-center flex items-center justify-center text-slate-100 font-mono text-sm sm:text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderedMath }}
          />
        );
      } catch {
        blocks.push(
          <div
            key={`mathblock-err-${blockKey++}`}
            className="my-3 p-3 bg-rose-950/40 border border-rose-800 text-rose-300 font-mono text-xs rounded-[8px]"
          >
            {mathExpr}
          </div>
        );
      }
      continue;
    }

    // 3. Headings: #, ##, ###, ####
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];

      if (level === 1) {
        blocks.push(
          <h1
            key={`h1-${blockKey++}`}
            className="text-lg sm:text-xl font-extrabold text-white mt-6 mb-3 pb-2 border-b border-slate-800 tracking-tight"
          >
            {renderInlineText(text)}
          </h1>
        );
      } else if (level === 2) {
        blocks.push(
          <h2
            key={`h2-${blockKey++}`}
            className="text-base sm:text-lg font-bold text-white mt-5 mb-2.5 tracking-tight flex items-center gap-2"
          >
            <span className="w-1.5 h-4 bg-cobalt-500 rounded-full inline-block" />
            {renderInlineText(text)}
          </h2>
        );
      } else if (level === 3) {
        blocks.push(
          <h3
            key={`h3-${blockKey++}`}
            className="text-sm sm:text-base font-bold text-slate-100 mt-4 mb-2 tracking-tight flex items-center gap-2"
          >
            <span className="w-1.5 h-3.5 bg-blue-500/80 rounded-full inline-block" />
            {renderInlineText(text)}
          </h3>
        );
      } else {
        blocks.push(
          <h4
            key={`h4-${blockKey++}`}
            className="text-xs sm:text-sm font-bold text-slate-200 mt-3 mb-1.5"
          >
            {renderInlineText(text)}
          </h4>
        );
      }
      i++;
      continue;
    }

    // 4. Code Block ```
    if (trimmed.startsWith('```')) {
      const lang = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      blocks.push(
        <div key={`codeblock-${blockKey++}`} className="my-4 rounded-[10px] overflow-hidden border border-slate-800 bg-slate-950">
          {lang && (
            <div className="px-4 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-mono text-slate-400">
              {lang}
            </div>
          )}
          <pre className="p-4 overflow-x-auto text-xs sm:text-sm font-mono text-emerald-300 leading-relaxed">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      continue;
    }

    // 5. Blockquote >
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      blocks.push(
        <blockquote
          key={`quote-${blockKey++}`}
          className="my-3 pl-4 py-2 border-l-4 border-cobalt-500 bg-slate-900/60 rounded-r-[8px] text-xs sm:text-sm text-slate-300 italic"
        >
          {renderInlineText(quoteLines.join(' '))}
        </blockquote>
      );
      continue;
    }

    // 6. Lists (Unordered * / - or Ordered 1.)
    const listMatch = trimmed.match(/^([-*+]|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const isOrdered = /^\d+\./.test(listMatch[1]);
      const listItems: string[] = [];

      while (i < lines.length) {
        const currTrimmed = lines[i].trim();
        const currMatch = currTrimmed.match(/^([-*+]|\d+\.)\s+(.*)$/);
        if (!currMatch) break;
        listItems.push(currMatch[2]);
        i++;
      }

      if (isOrdered) {
        blocks.push(
          <ol key={`ol-${blockKey++}`} className="my-3 pl-5 space-y-1.5 list-decimal text-xs sm:text-sm text-slate-200 leading-relaxed">
            {listItems.map((item, idx) => (
              <li key={`li-ol-${idx}`} className="pl-1">
                {renderInlineText(item)}
              </li>
            ))}
          </ol>
        );
      } else {
        blocks.push(
          <ul key={`ul-${blockKey++}`} className="my-3 pl-5 space-y-1.5 list-disc text-xs sm:text-sm text-slate-200 leading-relaxed">
            {listItems.map((item, idx) => (
              <li key={`li-ul-${idx}`} className="pl-1">
                {renderInlineText(item)}
              </li>
            ))}
          </ul>
        );
      }
      continue;
    }

    // 7. Regular Paragraph
    const paraLines: string[] = [trimmed];
    i++;
    while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith('#') && !lines[i].trim().startsWith('$$') && !lines[i].trim().startsWith('```') && !lines[i].trim().startsWith('>') && !lines[i].trim().match(/^([-*+]|\d+\.)\s+/)) {
      paraLines.push(lines[i].trim());
      i++;
    }

    blocks.push(
      <p key={`p-${blockKey++}`} className="my-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
        {renderInlineText(paraLines.join(' '))}
      </p>
    );
  }

  return <div className={`space-y-1 font-sans ${className}`}>{blocks}</div>;
}
