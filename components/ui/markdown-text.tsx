export function safeHttpUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') return parsed.toString();
    return null;
  } catch {
    return null;
  }
}

import { type ReactNode } from 'react';

function renderInlineMarkdown(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let remaining = text;
  let key = 0;

  const patterns: Array<{
    type: 'link' | 'bold' | 'code';
    regex: RegExp;
  }> = [
      { type: 'link', regex: /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/ },
      { type: 'bold', regex: /\*\*([^*]+)\*\*/ },
      { type: 'code', regex: /`([^`]+)`/ },
    ];

  while (remaining.length > 0) {
    let best:
      | { type: 'link' | 'bold' | 'code'; match: RegExpMatchArray; index: number }
      | null = null;

    for (const pattern of patterns) {
      const match = remaining.match(pattern.regex);
      if (!match || match.index === undefined) continue;
      if (!best || match.index < best.index) {
        best = { type: pattern.type, match, index: match.index };
      }
    }

    if (!best) {
      nodes.push(remaining);
      break;
    }

    if (best.index > 0) {
      nodes.push(remaining.slice(0, best.index));
    }

    if (best.type === 'bold') {
      nodes.push(<strong key={`b_${key++}`}>{best.match[1]}</strong>);
    } else if (best.type === 'code') {
      nodes.push(
        <code
          key={`c_${key++}`}
          className="px-1 py-0.5 rounded bg-background/60 border border-border font-mono text-sm"
        >
          {best.match[1]}
        </code>,
      );
    } else if (best.type === 'link') {
      const href = safeHttpUrl(best.match[2]);
      if (href) {
        nodes.push(
          <a
            key={`l_${key++}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 text-primary"
          >
            {best.match[1]}
          </a>,
        );
      } else {
        nodes.push(best.match[0]);
      }
    }

    remaining = remaining.slice(best.index + best.match[0].length);
  }

  return nodes;
}

export function MarkdownText({ content }: { content: string }) {
  const segments = content.split('```');
  const blocks: ReactNode[] = [];

  segments.forEach((segment, index) => {
    const isCode = index % 2 === 1;
    if (isCode) {
      const firstNewline = segment.indexOf('\n');
      const code = firstNewline === -1 ? segment : segment.slice(firstNewline + 1);
      blocks.push(
        <pre
          key={`code_${index}`}
          className="overflow-x-auto rounded-lg border border-border bg-background/40 p-4 text-sm"
        >
          <code className="font-mono whitespace-pre">{code.trimEnd()}</code>
        </pre>,
      );
      return;
    }

    const lines = segment.split('\n');
    let listBuffer: string[] = [];

    const flushList = () => {
      if (listBuffer.length === 0) return;
      blocks.push(
        <ul key={`ul_${index}_${blocks.length}`} className="list-disc pl-6 space-y-1">
          {listBuffer.map((item, i) => (
            <li key={`li_${index}_${i}`}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>,
      );
      listBuffer = [];
    };

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();

      const listMatch = line.match(/^\s*[-*]\s+(.*)$/);
      if (listMatch) {
        listBuffer.push(listMatch[1]);
        continue;
      }

      flushList();

      if (!line.trim()) {
        blocks.push(<div key={`sp_${index}_${blocks.length}`} className="h-2" />);
        continue;
      }

      const headingMatch = line.match(/^(#{1,3})\s+(.*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2];
        const className =
          level === 1
            ? 'text-lg font-semibold'
            : level === 2
              ? 'text-base font-semibold'
              : 'text-sm font-semibold';

        blocks.push(
          <div key={`h_${index}_${blocks.length}`} className={className}>
            {renderInlineMarkdown(text)}
          </div>,
        );
        continue;
      }

      blocks.push(
        <p key={`p_${index}_${blocks.length}`} className="whitespace-pre-wrap">
          {renderInlineMarkdown(line)}
        </p>,
      );
    }

    flushList();
  });

  return <div className="space-y-2">{blocks}</div>;
}
