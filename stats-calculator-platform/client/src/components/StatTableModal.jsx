import { useMemo, useState } from 'react';
import {
  buildZTableRows,
  buildTTableRows,
  T_ALPHA_HEADERS,
  buildChiSquareRows,
  CHI_COLUMN_DEFS,
  buildFTableRows,
  F_DF2_HEADERS,
} from '../data/statTables';

export function StatTableModal({ open, onClose, tableType, title }) {
  const [q, setQ] = useState('');

  const zRows = useMemo(() => (tableType === 'z' ? buildZTableRows() : []), [tableType]);
  const tRows = useMemo(() => (tableType === 't' ? buildTTableRows() : []), [tableType]);
  const chiRows = useMemo(() => (tableType === 'chi' ? buildChiSquareRows() : []), [tableType]);
  const fRows = useMemo(() => (tableType === 'f' ? buildFTableRows() : []), [tableType]);

  if (!open) return null;

  const filter = (text) => !q.trim() || text.toLowerCase().includes(q.trim().toLowerCase());

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="table-modal-title"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h2 id="table-modal-title" className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {title || 'Reference table'}
          </h2>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <input
              type="search"
              placeholder="Search row…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="min-w-[140px] flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Close
            </button>
          </div>
        </div>

        <div className="max-h-[calc(85vh-4rem)] overflow-auto p-4">
          {tableType === 'z' && (
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="border border-slate-200 px-2 py-1 text-left dark:border-slate-600">z</th>
                  {Array.from({ length: 10 }, (_, j) => (
                    <th
                      key={j}
                      className={`border border-slate-200 px-1 py-1 dark:border-slate-600 ${[0, 5, 9].includes(j) ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                    >
                      .0{j}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {zRows
                  .filter((row) => filter(row.label) || row.cells.some((c) => filter(c.z)))
                  .map((row) => (
                  <tr key={row.label}>
                    <td className="border border-slate-200 px-2 py-0.5 font-medium dark:border-slate-600">
                      {row.label}
                    </td>
                    {row.cells.map((c) => (
                      <td
                        key={c.z}
                        className="border border-slate-200 px-1 py-0.5 text-center font-mono text-xs dark:border-slate-600"
                      >
                        {c.p}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tableType === 't' && (
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="border border-slate-200 px-2 py-1 text-left dark:border-slate-600">df</th>
                  {T_ALPHA_HEADERS.map((h) => (
                    <th
                      key={h.field}
                      className={`border border-slate-200 px-2 py-1 dark:border-slate-600 ${h.highlight ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tRows
                  .filter((r) => filter(String(r.df)))
                  .map((row) => (
                    <tr key={row.df}>
                      <td className="border border-slate-200 px-2 py-0.5 font-medium dark:border-slate-600">
                        {row.df}
                      </td>
                      {T_ALPHA_HEADERS.map((h) => (
                        <td
                          key={h.field}
                          className={`border border-slate-200 px-2 py-0.5 text-center font-mono dark:border-slate-600 ${h.highlight ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                        >
                          {row[h.field]}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {tableType === 'chi' && (
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="border border-slate-200 px-2 py-1 dark:border-slate-600">df</th>
                  {CHI_COLUMN_DEFS.map((c) => (
                    <th
                      key={c.field}
                      className={`border border-slate-200 px-1 py-1 dark:border-slate-600 ${c.highlight ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {chiRows
                  .filter((r) => filter(String(r.df)))
                  .map((row) => (
                    <tr key={row.df}>
                      <td className="border border-slate-200 px-2 py-0.5 font-medium dark:border-slate-600">
                        {row.df}
                      </td>
                      {CHI_COLUMN_DEFS.map((c) => (
                        <td
                          key={c.field}
                          className={`border border-slate-200 px-1 py-0.5 text-center font-mono text-xs dark:border-slate-600 ${c.highlight ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                        >
                          {row[c.field]}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {tableType === 'f' && (
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="border border-slate-200 px-2 py-1 dark:border-slate-600">df₁</th>
                  {F_DF2_HEADERS.map((h) => (
                    <th
                      key={h.field}
                      className={`border border-slate-200 px-1 py-1 dark:border-slate-600 ${h.highlight ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}
                    >
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fRows
                  .filter((r) => filter(String(r.df1)))
                  .map((row) => (
                    <tr key={row.df1}>
                      <td className="border border-slate-200 px-2 py-0.5 font-medium dark:border-slate-600">
                        {row.df1}
                      </td>
                      {F_DF2_HEADERS.map((h) => (
                        <td
                          key={h.field}
                          className={`border border-slate-200 px-1 py-0.5 text-center font-mono text-xs dark:border-slate-600 ${h.highlight ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''}`}
                        >
                          {row[h.field]}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {!tableType && <p className="text-slate-600 dark:text-slate-400">No table for this test.</p>}
        </div>
      </div>
    </div>
  );
}
