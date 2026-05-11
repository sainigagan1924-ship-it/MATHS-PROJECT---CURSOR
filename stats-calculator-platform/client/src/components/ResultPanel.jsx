import { FormulaBlock } from './FormulaBlock';
import { DistributionPlot } from './DistributionPlot';
import { TooltipTerm } from './TooltipTerm';

export function ResultPanel({ result, testLabel }) {
  if (!result) return null;

  const alt = result.parameters?.alternative;
  const plotAlt =
    alt ||
    (result.plot?.curve?.family === 'chisq' || result.plot?.curve?.family === 'f' ? 'greater' : 'two-sided');

  return (
    <div id="calc-export-root" className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      {testLabel && <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{testLabel}</h2>}

      {result.narrative && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900/50 dark:bg-amber-950/40">
          <p>
            <strong>H₀:</strong> {result.narrative.h0}
          </p>
          <p className="mt-1">
            <strong>H₁:</strong> {result.narrative.h1}
          </p>
          <ol className="mt-2 list-decimal pl-5 text-slate-700 dark:text-slate-300">
            {result.narrative.steps?.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      )}

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Formula
        </h3>
        <FormulaBlock tex={result.formula} className="mt-2" />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Test statistic</h3>
          <p className="mt-2 font-mono text-2xl font-bold text-brand-700 dark:text-brand-400">{result.testStatistic}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            <TooltipTerm label="p-value" tip="Probability of a result at least this extreme if H₀ is true." />
          </h3>
          <p className="mt-2 font-mono text-2xl font-bold text-slate-900 dark:text-white">{result.pValue}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700 md:col-span-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Critical value(s)</h3>
          <pre className="mt-2 overflow-x-auto rounded bg-slate-50 p-3 font-mono text-sm dark:bg-slate-800">
            {JSON.stringify(result.criticalValue, null, 2)}
          </pre>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Rejection / acceptance
        </h3>
        <p className="mt-2 text-slate-700 dark:text-slate-300">{result.rejectionRegion}</p>
        <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-800">
          <strong>Decision:</strong> {result.reject ? 'Reject H₀' : 'Fail to reject H₀'}
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Manual calculation steps
        </h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-slate-700 dark:text-slate-300">
          {result.manualSteps?.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Library method (jStat)
        </h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          The same conclusion is supported using <code className="rounded bg-slate-100 px-1 dark:bg-slate-800">{result.library?.method}</code> for
          tail probabilities. Reported p-value: <strong>{result.library?.pValue ?? result.pValue}</strong>
          {result.library?.df != null && (
            <>
              , df: <strong>{result.library.df}</strong>
            </>
          )}
          .
        </p>
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Distribution
        </h3>
        <DistributionPlot plot={result.plot} alternative={plotAlt} />
      </section>

      <section>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Interpretation
        </h3>
        <p className="mt-2 text-slate-700 dark:text-slate-300">{result.interpretation}</p>
        <p className="mt-2 font-medium text-slate-900 dark:text-white">{result.conclusion}</p>
      </section>

      {result.extras?.expected && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Expected counts (chi-square)
          </h3>
          <pre className="mt-2 max-h-48 overflow-auto rounded bg-slate-50 p-3 text-xs dark:bg-slate-800">
            {JSON.stringify(result.extras.expected, null, 2)}
          </pre>
        </section>
      )}
    </div>
  );
}
