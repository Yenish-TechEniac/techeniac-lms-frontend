'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Span } from '@/components/ui/Typography';

interface MarkdownViewerProps {
  content: string;
  className?: string | undefined;
}

interface Block {
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'code' | 'hr' | 'blockquote' | 'ul' | 'ol' | 'p';
  text?: string | undefined;
  items?: string[] | undefined;
  lang?: string | undefined;
  code?: string | undefined;
}

function isSafeMarkdownUrl(urlString: string): boolean {
  try {
    const trimmed = urlString.trim();
    if (!trimmed) return false;
    const parsed = new URL(trimmed);
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

function renderInline(text: string): React.ReactNode {
  // Regex to match inline code, bold, italic, and links
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g);

  return tokens.map((token, i) => {
    if (!token) return null;

    // Inline code `code`
    if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      return (
        <code
          key={i}
          className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-rose-600"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    // Bold **text**
    if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
      return (
        <strong key={i} className="font-bold text-slate-900">
          {renderInline(token.slice(2, -2))}
        </strong>
      );
    }

    // Italic *text*
    if (token.startsWith('*') && token.endsWith('*') && token.length >= 2) {
      return (
        <em key={i} className="text-slate-800 italic">
          {renderInline(token.slice(1, -1))}
        </em>
      );
    }

    // Link [text](url)
    const linkMatch = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(token);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      if (url && isSafeMarkdownUrl(url)) {
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-blue-600 underline hover:text-blue-700"
          >
            {label}
          </a>
        );
      }

      return (
        <span key={i} className="font-medium text-slate-700" title="Blocked link">
          {label}
        </span>
      );
    }

    return <React.Fragment key={i}>{token}</React.Fragment>;
  });
}

function CodeBlock({ lang, code = '' }: { lang?: string | undefined; code?: string | undefined }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (code) {
      void navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative my-3 overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-md">
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-3.5 py-1.5 text-[11px] font-medium text-slate-400">
        <Span className="font-mono text-[10px] font-bold tracking-wider text-slate-300 uppercase">
          {lang || 'CODE'}
        </Span>
        <Button
          type="button"
          onClick={handleCopy}
          className="rounded px-2 py-0.5 text-[10px] font-semibold text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case 'h1':
      return (
        <h1 className="mt-4 mb-2 border-b border-slate-200 pb-2 text-xl font-extrabold tracking-tight text-slate-900">
          {renderInline(block.text || '')}
        </h1>
      );
    case 'h2':
      return (
        <h2 className="mt-4 mb-2 text-base font-bold tracking-tight text-slate-900">
          {renderInline(block.text || '')}
        </h2>
      );
    case 'h3':
      return (
        <h3 className="mt-3 mb-1 text-sm font-bold text-slate-800">
          {renderInline(block.text || '')}
        </h3>
      );
    case 'h4':
      return (
        <h4 className="mt-2.5 mb-1 text-xs font-bold tracking-wide text-slate-800 uppercase">
          {renderInline(block.text || '')}
        </h4>
      );
    case 'hr':
      return <hr className="my-4 border-t border-slate-200" />;
    case 'code':
      return <CodeBlock lang={block.lang} code={block.code} />;
    case 'blockquote':
      return (
        <blockquote className="my-3 rounded-r-lg border-l-4 border-blue-500 bg-blue-50/60 px-4 py-2 text-xs text-slate-700 italic">
          {renderInline(block.text || '')}
        </blockquote>
      );
    case 'ul':
      return (
        <ul className="my-2 list-disc space-y-1 pl-5 text-xs text-slate-700">
          {(block.items || []).map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
    case 'ol':
      return (
        <ol className="my-2 list-decimal space-y-1 pl-5 text-xs text-slate-700">
          {(block.items || []).map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
    case 'p':
      return (
        <p className="my-1.5 text-xs leading-relaxed text-slate-700">
          {renderInline(block.text || '')}
        </p>
      );
    default:
      return null;
  }
}

export function MarkdownViewer({ content, className = '' }: MarkdownViewerProps) {
  if (!content) return null;

  const blocks: Block[] = [];
  const lines = content.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (line === undefined) {
      i++;
      continue;
    }

    // Fenced Code Block
    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        if (nextLine === undefined || nextLine.trim().startsWith('```')) {
          break;
        }
        codeLines.push(nextLine);
        i++;
      }
      blocks.push({
        type: 'code',
        lang: lang || 'code',
        code: codeLines.join('\n'),
      });
      i++;
      continue;
    }

    // Horizontal Rule (---, ***, ___)
    if (/^(\s*[-*_]\s*){3,}$/.test(line)) {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.slice(2).trim() });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith('#### ')) {
      blocks.push({ type: 'h4', text: line.slice(5).trim() });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      const quoteLines: string[] = [line.replace(/^>\s?/, '')];
      i++;
      while (i < lines.length) {
        const nextLine = lines[i];
        if (nextLine === undefined || !nextLine.startsWith('>')) {
          break;
        }
        quoteLines.push(nextLine.replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join(' ') });
      continue;
    }

    // Unordered List
    if (/^\s*[*+-]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const nextLine = lines[i];
        if (nextLine === undefined || !/^\s*[*+-]\s+/.test(nextLine)) {
          break;
        }
        items.push(nextLine.replace(/^\s*[*+-]\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ul', items });
      continue;
    }

    // Ordered List
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length) {
        const nextLine = lines[i];
        if (nextLine === undefined || !/^\s*\d+\.\s+/.test(nextLine)) {
          break;
        }
        items.push(nextLine.replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // Empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Regular paragraph
    const pLines: string[] = [line];
    i++;
    while (i < lines.length) {
      const nextLine = lines[i];
      if (
        nextLine === undefined ||
        !nextLine.trim() ||
        nextLine.trim().startsWith('```') ||
        nextLine.startsWith('#') ||
        nextLine.startsWith('>') ||
        /^\s*[*+-]\s+/.test(nextLine) ||
        /^\s*\d+\.\s+/.test(nextLine) ||
        /^(\s*[-*_]\s*){3,}$/.test(nextLine)
      ) {
        break;
      }
      pLines.push(nextLine);
      i++;
    }
    blocks.push({ type: 'p', text: pLines.join(' ') });
  }

  return (
    <div className={`space-y-3 leading-relaxed text-slate-800 ${className}`}>
      {blocks.map((block, idx) => (
        <BlockRenderer key={idx} block={block} />
      ))}
    </div>
  );
}
