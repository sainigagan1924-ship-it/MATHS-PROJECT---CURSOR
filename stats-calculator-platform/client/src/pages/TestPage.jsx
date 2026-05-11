import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getTestById, T_TEST_CONDITIONS } from '../data/testDefinitions';
import { calculateTest, fetchShare, saveCalculation } from '../utils/api';
import { StatTableModal } from '../components/StatTableModal';
import { ResultPanel } from '../components/ResultPanel';
import { exportElementToPdf } from '../utils/exportPdf';

const CONF_TO_ALPHA = { 90: 0.1, 95: 0.05, 99: 0.01 };

function buildPayload(meta, values) {
  const payload = { ...values };
  if (meta.fields.some((f) => f.name === 'alpha')) {
    payload.alpha = Number(payload.alpha);
  }
  if (meta.id === 'chi-square-test') {
    payload.table = JSON.parse(payload.table);
  }
  if (meta.id === 'anova') {
    payload.groups = JSON.parse(payload.groups);
  }
  if (meta.fields.some((f) => f.name === 'variance')) {
    payload.variance = payload.variance || 'pooled';
  }
  Object.keys(payload).forEach((k) => {
    if (payload[k] === '' || payload[k] == null) delete payload[k];
  });
  return payload;
}

function validate(meta, values) {
  for (const f of meta.fields) {
    if (f.optional) continue;
    const v = values[f.name];
    if (v === '' || v == null) return `${f.label} is required`;
  }
  if (meta.id === 'chi-square-test') {
    try {
      JSON.parse(values.table);
    } catch {
      return 'Contingency table must be valid JSON';
    }
  }
  if (meta.id === 'anova') {
    try {
      const g = JSON.parse(values.groups);
      if (!Array.isArray(g) || g.length < 2) return 'ANOVA needs at least two groups';
    } catch {
      return 'Groups must be valid JSON array of arrays';
    }
  }
  return null;
}

export function TestPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const meta = useMemo(() => getTestById(testId), [testId]);

  const [values, setValues] = useState({});
  const [confidence, setConfidence] = useState(95);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableOpen, setTableOpen] = useState(true);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    if (!meta) return;
    setValues({ ...meta.example });
    setResult(null);
    setShareLink('');
    setTableOpen(true);
    const shareToken = searchParams.get('share');
    if (shareToken) {
      (async () => {
        try {
          const data = await fetchShare(shareToken);
          if (data?.item?.resultSnapshot) {
            setResult(data.item.resultSnapshot);
            setValues(data.item.inputs || {});
            toast.success('Loaded shared calculation');
          }
        } catch {
          toast.error('Could not load shared result');
        }
      })();
    }
  }, [meta, testId, searchParams]);

  const onField = useCallback((name, v) => {
    setValues((prev) => ({ ...prev, [name]: v }));
  }, []);

  const applyConfidence = useCallback(
    (c) => {
      setConfidence(c);
      if (meta?.fields.some((f) => f.name === 'alpha')) {
        setValues((prev) => ({ ...prev, alpha: CONF_TO_ALPHA[c] ?? 0.05 }));
      }
    },
    [meta]
  );

  const run = useCallback(async () => {
    if (!meta) return;
    const err = validate(meta, values);
    if (err) {
      toast.error(err);
      return;
    }
    let payload;
    try {
      payload = buildPayload(meta, values);
    } catch (e) {
      toast.error(e.message || 'Invalid input');
      return;
    }
    setLoading(true);
    setShareLink('');
    try {
      const data = await calculateTest(meta.id, payload);
      setResult(data.result);
      toast.success('Calculated');
    } catch (e) {
      const msg = e.response?.data?.error || e.message || 'Request failed';
      toast.error(msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [meta, values]);

  const loadExample = () => {
    if (!meta) return;
    setValues({ ...meta.example });
    setResult(null);
    toast('Example values loaded', { icon: 'ℹ️' });
  };

  const reset = () => {
    if (!meta) return;
    setValues({});
    setResult(null);
    setShareLink('');
  };

  const copyResult = async () => {
    if (!result) return;
    const text = [
      `Test: ${meta?.title}`,
      `Statistic: ${result.testStatistic}`,
      `p-value: ${result.pValue}`,
      result.conclusion,
    ].join('\n');
    await navigator.clipboard.writeText(text);
    toast.success('Copied summary');
  };

  const save = async (withShare) => {
    if (!meta || !result) return;
    try {
      const res = await saveCalculation({
        testId: meta.id,
        testLabel: meta.title,
        inputs: values,
        resultSnapshot: result,
        summary: result.conclusion,
        generateShare: withShare,
      });
      if (withShare && res.item?.shareToken) {
        const url = `${window.location.origin}/share/${res.item.shareToken}`;
        setShareLink(url);
        await navigator.clipboard.writeText(url);
        toast.success('Saved with share link (copied)');
      } else {
        toast.success('Saved to history');
      }
    } catch (e) {
      toast.error(e.response?.data?.error || 'Save failed (is MongoDB running?)');
    }
  };

  const pdf = async () => {
    const el = document.getElementById('calc-export-root');
    if (!el) {
      toast.error('Calculate first');
      return;
    }
    await toast.promise(exportElementToPdf(el, `${meta?.id || 'result'}.pdf`), {
      loading: 'Building PDF…',
      success: 'PDF downloaded',
      error: 'PDF export failed',
    });
  };

  if (!meta) {
    return (
      <div className="rounded-xl border border-slate-200 p-8 text-center dark:border-slate-800">
        <p>Unknown test.</p>
        <button type="button" className="mt-4 text-brand-600 underline" onClick={() => navigate('/')}>
          Back home
        </button>
      </div>
    );
  }

  const tableTitles = {
    z: 'Standard normal cumulative probabilities',
    t: 'Student t critical values (upper tail symmetric)',
    chi: 'Chi-square distribution (selected quantiles)',
    f: 'F distribution (upper 5% critical values, illustrative)',
  };

  return (
    <div className="space-y-8">
      <StatTableModal
        open={tableOpen}
        onClose={() => setTableOpen(false)}
        tableType={meta.tableType}
        title={tableTitles[meta.tableType]}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase text-brand-600 dark:text-brand-400">{meta.category}</p>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{meta.title}</h1>
          <p className="text-slate-600 dark:text-slate-400">{meta.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setTableOpen(true)}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
        >
          View statistical table
        </button>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:items-start lg:gap-8">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Inputs</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {meta.fields.map((f) => (
                <label key={f.name} className={f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{f.label}</span>
                  {f.type === 'textarea' && (
                    <textarea
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                      rows={3}
                      value={values[f.name] ?? ''}
                      onChange={(e) => onField(f.name, e.target.value)}
                    />
                  )}
                  {f.type === 'text' && (
                    <input
                      type="text"
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                      value={values[f.name] ?? ''}
                      onChange={(e) => onField(f.name, e.target.value)}
                    />
                  )}
                  {(f.type === 'number' || f.type === 'int') && (
                    <input
                      type="number"
                      step={f.step || (f.type === 'int' ? 1 : 'any')}
                      min={f.min}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                      value={values[f.name] ?? ''}
                      onChange={(e) => onField(f.name, e.target.value)}
                    />
                  )}
                  {f.type === 'select' && (
                    <select
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
                      value={values[f.name] ?? f.options[0].value}
                      onChange={(e) => onField(f.name, e.target.value)}
                    >
                      {f.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  )}
                  {f.hint && <p className="mt-1 text-xs text-slate-500">{f.hint}</p>}
                </label>
              ))}
            </div>
          </div>

          {meta.category === 'T-Test' && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">When to use a t-test</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
                {T_TEST_CONDITIONS.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {loading && (
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Computing…</span>
            </div>
          )}

          {result && <ResultPanel result={result} testLabel={meta.title} />}
        </div>

        <aside className="mt-8 space-y-4 lg:sticky lg:top-24 lg:mt-0">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Confidence level (sets α)
            </label>
            <select
              className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
              value={confidence}
              onChange={(e) => applyConfidence(Number(e.target.value))}
            >
              <option value={90}>90% (α = 0.10)</option>
              <option value={95}>95% (α = 0.05)</option>
              <option value={99}>99% (α = 0.01)</option>
            </select>
            <p className="mt-2 text-xs text-slate-500">Common mapping for two-sided tests; α field updates when applicable.</p>

            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={run}
                disabled={loading}
                className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 dark:bg-brand-500 dark:hover:bg-brand-600"
              >
                Calculate
              </button>
              <button
                type="button"
                onClick={loadExample}
                className="w-full rounded-lg border border-slate-300 py-2 text-sm dark:border-slate-600"
              >
                Example input
              </button>
              <button type="button" onClick={reset} className="w-full rounded-lg border border-slate-300 py-2 text-sm dark:border-slate-600">
                Reset
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase text-slate-500">Export &amp; share</p>
            <div className="mt-3 flex flex-col gap-2">
              <button type="button" onClick={pdf} className="rounded-lg border border-slate-300 py-2 text-sm dark:border-slate-600">
                Export PDF
              </button>
              <button type="button" onClick={copyResult} disabled={!result} className="rounded-lg border border-slate-300 py-2 text-sm dark:border-slate-600">
                Copy result
              </button>
              <button type="button" onClick={() => save(false)} disabled={!result} className="rounded-lg border border-slate-300 py-2 text-sm dark:border-slate-600">
                Save to history
              </button>
              <button type="button" onClick={() => save(true)} disabled={!result} className="rounded-lg border border-brand-600 py-2 text-sm text-brand-700 dark:border-brand-500 dark:text-brand-300">
                Save + share link
              </button>
            </div>
            {shareLink && (
              <p className="mt-3 break-all text-xs text-slate-600 dark:text-slate-400">
                Link: <a href={shareLink} className="text-brand-600 underline">{shareLink}</a>
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
