import { Link } from 'react-router-dom';
import { TEST_LIST } from '../data/testDefinitions';

export function Home() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8 dark:border-slate-800 dark:from-slate-900 dark:to-slate-950">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Statistics calculators
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
          Choose a test, enter your values, and get step-by-step working, critical values, p-values, charts,
          and both manual and library-based results — similar in spirit to dedicated calculator sites, with a
          clean student-focused layout.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-800 dark:text-slate-100">All tests</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {TEST_LIST.map((t) => (
            <Link
              key={t.id}
              to={`/test/${t.id}`}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-500"
            >
              <p className="text-xs font-medium uppercase text-brand-600 dark:text-brand-400">{t.category}</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{t.title}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
