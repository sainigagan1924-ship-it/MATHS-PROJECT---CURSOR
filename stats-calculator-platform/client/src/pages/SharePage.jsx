import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchShare } from '../utils/api';
import { ResultPanel } from '../components/ResultPanel';

export function SharePage() {
  const { token } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchShare(token);
        if (!cancelled) setItem(data.item);
      } catch {
        if (!cancelled) {
          setItem(null);
          toast.error('Shared result not found');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-white px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl">
        <Link to="/" className="text-sm text-brand-600 hover:underline dark:text-brand-400">
          ← Home
        </Link>
        {loading && <p className="mt-8 text-slate-500">Loading…</p>}
        {!loading && item?.resultSnapshot && (
          <div className="mt-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{item.testLabel}</h1>
            <p className="mt-1 text-sm text-slate-500">Shared snapshot — inputs are read-only below.</p>
            <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-900">
              {JSON.stringify(item.inputs, null, 2)}
            </pre>
            <div className="mt-6">
              <ResultPanel result={item.resultSnapshot} />
            </div>
          </div>
        )}
        {!loading && !item?.resultSnapshot && (
          <p className="mt-8 text-slate-600 dark:text-slate-400">This share link is invalid or expired.</p>
        )}
      </div>
    </div>
  );
}
