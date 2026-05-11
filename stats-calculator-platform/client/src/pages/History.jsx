import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { deleteSaved, fetchSaved } from '../utils/api';

export function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchSaved(50);
      setItems(data.items || []);
    } catch {
      toast.error('Could not load saved items (MongoDB may be offline)');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    try {
      await deleteSaved(id);
      toast.success('Deleted');
      load();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Saved calculations</h1>
      <p className="text-slate-600 dark:text-slate-400">
        Recent runs stored in MongoDB. Use <strong>Save + share link</strong> on a test page to create a shareable URL.
      </p>

      {loading && <p className="text-sm text-slate-500">Loading…</p>}

      {!loading && items.length === 0 && (
        <p className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          No saved calculations yet. Run a test and click &quot;Save to history&quot;.
        </p>
      )}

      <ul className="space-y-3">
        {items.map((it) => (
          <li
            key={it._id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div>
              <Link to={`/test/${it.testId}`} className="font-semibold text-brand-700 hover:underline dark:text-brand-400">
                {it.testLabel}
              </Link>
              <p className="text-xs text-slate-500">{new Date(it.createdAt).toLocaleString()}</p>
              {it.summary && <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{it.summary}</p>}
              {it.shareToken && (
                <p className="mt-1 text-xs">
                  <Link className="text-brand-600 underline" to={`/share/${it.shareToken}`}>
                    Open shared result
                  </Link>
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(it._id)}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/50"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
