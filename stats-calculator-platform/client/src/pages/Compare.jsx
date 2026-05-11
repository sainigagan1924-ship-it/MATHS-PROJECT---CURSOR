import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { TEST_LIST, getTestById } from '../data/testDefinitions';
import { calculateTest } from '../utils/api';
import { ResultPanel } from '../components/ResultPanel';

function Side({ label, testId, onTestId, body, onBody, result, onRun, loading }) {
  const meta = getTestById(testId);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</h2>
      <label className="mt-3 block text-sm font-medium">Test</label>
      <select
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
        value={testId}
        onChange={(e) => onTestId(e.target.value)}
      >
        {TEST_LIST.map((t) => (
          <option key={t.id} value={t.id}>
            {t.title}
          </option>
        ))}
      </select>
      <label className="mt-3 block text-sm font-medium">Request JSON body</label>
      <textarea
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
        rows={10}
        value={body}
        onChange={(e) => onBody(e.target.value)}
      />
      <p className="mt-1 text-xs text-slate-500">Must match API fields for {meta?.title}.</p>
      <button
        type="button"
        disabled={loading}
        onClick={onRun}
        className="mt-3 w-full rounded-lg bg-brand-600 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50 dark:bg-brand-500"
      >
        {loading ? '…' : 'Calculate'}
      </button>
      {result && (
        <div className="mt-6 max-h-[70vh] overflow-y-auto border-t border-slate-200 pt-4 dark:border-slate-700">
          <ResultPanel result={result} />
        </div>
      )}
    </div>
  );
}

export function Compare() {
  const ex1 = useMemo(() => JSON.stringify(getTestById('t-test-one-sample')?.example ?? {}, null, 2), []);
  const ex2 = useMemo(() => JSON.stringify(getTestById('z-test-one-sample')?.example ?? {}, null, 2), []);

  const [leftId, setLeftId] = useState('t-test-one-sample');
  const [rightId, setRightId] = useState('z-test-one-sample');
  const [leftBody, setLeftBody] = useState(ex1);
  const [rightBody, setRightBody] = useState(ex2);
  const [leftRes, setLeftRes] = useState(null);
  const [rightRes, setRightRes] = useState(null);
  const [loadL, setLoadL] = useState(false);
  const [loadR, setLoadR] = useState(false);

  useEffect(() => {
    const m = getTestById(leftId);
    if (m?.example) setLeftBody(JSON.stringify(m.example, null, 2));
  }, [leftId]);

  useEffect(() => {
    const m = getTestById(rightId);
    if (m?.example) setRightBody(JSON.stringify(m.example, null, 2));
  }, [rightId]);

  const runLeft = async () => {
    setLoadL(true);
    try {
      const parsed = JSON.parse(leftBody);
      const data = await calculateTest(leftId, parsed);
      setLeftRes(data.result);
      toast.success('Left updated');
    } catch (e) {
      toast.error(e.response?.data?.error || e.message || 'Left failed');
    } finally {
      setLoadL(false);
    }
  };

  const runRight = async () => {
    setLoadR(true);
    try {
      const parsed = JSON.parse(rightBody);
      const data = await calculateTest(rightId, parsed);
      setRightRes(data.result);
      toast.success('Right updated');
    } catch (e) {
      toast.error(e.response?.data?.error || e.message || 'Right failed');
    } finally {
      setLoadR(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Compare two tests</h1>
      <p className="text-slate-600 dark:text-slate-400">
        Run two different procedures side by side (e.g. t vs z on related summaries). Edit JSON to match each
        endpoint&apos;s expected fields.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <Side
          label="Left"
          testId={leftId}
          onTestId={setLeftId}
          body={leftBody}
          onBody={setLeftBody}
          result={leftRes}
          onRun={runLeft}
          loading={loadL}
        />
        <Side
          label="Right"
          testId={rightId}
          onTestId={setRightId}
          body={rightBody}
          onBody={setRightBody}
          result={rightRes}
          onRun={runRight}
          loading={loadR}
        />
      </div>
    </div>
  );
}
