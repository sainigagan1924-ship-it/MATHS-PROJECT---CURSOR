import { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Renders LaTeX using KaTeX (display mode).
 */
export function FormulaBlock({ tex, className = '' }) {
  const html = useMemo(() => {
    if (!tex) return '';
    try {
      return katex.renderToString(tex, { displayMode: true, throwOnError: false });
    } catch {
      return '';
    }
  }, [tex]);

  return (
    <div
      className={`rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center dark:border-slate-600 dark:bg-slate-800/50 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function InlineFormula({ tex }) {
  const html = useMemo(() => {
    if (!tex) return '';
    try {
      return katex.renderToString(tex, { displayMode: false, throwOnError: false });
    } catch {
      return '';
    }
  }, [tex]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
