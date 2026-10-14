import React, { useMemo } from 'react';

export interface FormattedMathTextProps {
  readonly text: string;
  readonly className?: string;
  readonly displayMode?: boolean;
}

function cleanMathString(raw: string): string {
  return raw
    .replace(/^(\$\$|\$|\\\[|\\\()/, '')
    .replace(/(\$\$|\$|\\\]|\\\))$/, '')
    .trim()
    .replace(/\\Theta/g, 'Θ')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\implies/g, '⟹')
    .replace(/\\log/g, 'log')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\mathit\{([^}]+)\}/g, '$1')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\^d/g, 'ᵈ')
    .replace(/\^n/g, 'ⁿ')
    .replace(/_b/g, '₍ᵦ₎')
    .replace(/_2/g, '₂')
    .replace(/_1/g, '₁')
    .replace(/\\([a-zA-Z]+)/g, '$1')
    .replace(/[{}]/g, '');
}

export const FormattedMathText: React.FC<FormattedMathTextProps> = ({
  text,
  className = '',
  displayMode = false,
}) => {
  const parts = useMemo(() => {
    if (!text) return [];
    const regex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g;
    const tokens: { type: 'text' | 'math'; content: string; isDisplay?: boolean }[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push({ type: 'text', content: text.slice(lastIndex, match.index) });
      }
      const raw = match[0];
      const isDisplay = raw.startsWith('$$') || raw.startsWith('\\[');
      tokens.push({
        type: 'math',
        content: cleanMathString(raw),
        isDisplay: isDisplay || displayMode,
      });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      tokens.push({ type: 'text', content: text.slice(lastIndex) });
    }

    if (tokens.length === 0 && text) {
      if (text.includes('\\') || /^[OΘΩ]\(/.test(text.trim())) {
        return [{ type: 'math' as const, content: cleanMathString(text), isDisplay: displayMode }];
      }
      return [{ type: 'text' as const, content: text }];
    }

    return tokens;
  }, [text, displayMode]);

  if (!text) return null;

  return (
    <span className={`inline leading-relaxed ${className}`.trim()}>
      {parts.map((p, idx) => {
        if (p.type === 'math') {
          if (p.isDisplay) {
            return (
              <span
                key={idx}
                className="block text-center font-mono text-ink-primary bg-surface-container-low px-2 py-1 rounded my-1 border border-paper-border text-xs"
              >
                {p.content}
              </span>
            );
          }
          return (
            <span
              key={idx}
              className="font-mono text-ink-primary font-semibold px-1 py-0.5 rounded bg-surface-container-low/70 text-[0.92em]"
            >
              {p.content}
            </span>
          );
        }
        return <span key={idx}>{p.content}</span>;
      })}
    </span>
  );
};

export default FormattedMathText;

