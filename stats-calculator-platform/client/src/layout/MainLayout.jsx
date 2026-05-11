import { Link, NavLink, Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const navClass = ({ isActive }) =>
  [
    'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-brand-600 text-white dark:bg-brand-500'
      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
  ].join(' ');

export function MainLayout() {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="text-lg font-semibold tracking-tight text-brand-700 dark:text-brand-400">
            StatsCalc Pro
          </Link>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/" className={navClass} end>
              Home
            </NavLink>
            <NavLink to="/about" className={navClass}>
              About
            </NavLink>
            <NavLink to="/formulas" className={navClass}>
              Formulas
            </NavLink>
            <NavLink to="/history" className={navClass}>
              Saved
            </NavLink>
            <NavLink to="/compare" className={navClass}>
              Compare
            </NavLink>
            <button
              type="button"
              onClick={toggle}
              className="ml-2 rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 lg:flex-row">
        <aside className="lg:w-56 lg:flex-shrink-0">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Tests
            </p>
            <ul className="space-y-1">
              <li>
                <Link to="/test/hypothesis-testing-1" className="block text-sm text-brand-600 hover:underline dark:text-brand-400">
                  Hypothesis 1
                </Link>
              </li>
              <li>
                <Link to="/test/hypothesis-testing-2" className="block text-sm text-brand-600 hover:underline dark:text-brand-400">
                  Hypothesis 2
                </Link>
              </li>
              <li>
                <Link to="/test/hypothesis-testing-3" className="block text-sm text-brand-600 hover:underline dark:text-brand-400">
                  Hypothesis 3
                </Link>
              </li>
              <li>
                <Link to="/test/z-test-one-sample" className="block text-sm text-brand-600 hover:underline dark:text-brand-400">
                  Z one-sample
                </Link>
              </li>
              <li>
                <Link to="/test/z-test-two-sample" className="block text-sm text-brand-600 hover:underline dark:text-brand-400">
                  Z two-sample
                </Link>
              </li>
              <li>
                <Link to="/test/t-test-one-sample" className="block text-sm text-brand-600 hover:underline dark:text-brand-400">
                  T one-sample
                </Link>
              </li>
              <li>
                <Link to="/test/t-test-two-sample" className="block text-sm text-brand-600 hover:underline dark:text-brand-400">
                  T two-sample
                </Link>
              </li>
              <li>
                <Link to="/test/t-test-paired" className="block text-sm text-brand-600 hover:underline dark:text-brand-400">
                  T paired
                </Link>
              </li>
              <li>
                <Link to="/test/chi-square-test" className="block text-sm text-brand-600 hover:underline dark:text-brand-400">
                  Chi-square
                </Link>
              </li>
              <li>
                <Link to="/test/anova" className="block text-sm text-brand-600 hover:underline dark:text-brand-400">
                  ANOVA
                </Link>
              </li>
            </ul>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>

      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
        Educational statistics calculators — verify coursework with your instructor.
      </footer>
    </div>
  );
}
