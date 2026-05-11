import { FormulaBlock } from '../components/FormulaBlock';

const blocks = [
  { title: 'One-sample Z (σ known)', tex: String.raw`z = \frac{\bar{x}-\mu_0}{\sigma/\sqrt{n}}` },
  { title: 'Two-sample Z', tex: String.raw`z = \frac{(\bar{x}_1-\bar{x}_2)-D_0}{\sqrt{\sigma_1^2/n_1+\sigma_2^2/n_2}}` },
  { title: 'One-sample t', tex: String.raw`t = \frac{\bar{x}-\mu_0}{s/\sqrt{n}},\quad df=n-1` },
  { title: 'Pooled two-sample t', tex: String.raw`s_p^2 = \frac{(n_1-1)s_1^2+(n_2-1)s_2^2}{n_1+n_2-2},\quad t=\frac{(\bar{x}_1-\bar{x}_2)-D_0}{s_p\sqrt{1/n_1+1/n_2}}` },
  { title: 'Paired t', tex: String.raw`t=\frac{\bar{d}}{s_d/\sqrt{n}},\quad df=n-1` },
  {
    title: 'Chi-square (independence)',
    tex: String.raw`\chi^2=\sum_{i,j}\frac{(O_{ij}-E_{ij})^2}{E_{ij}},\quad E_{ij}=\frac{R_iC_j}{N},\quad df=(r-1)(c-1)`,
  },
  {
    title: 'One-way ANOVA',
    tex: String.raw`F=\frac{MS_B}{MS_W},\quad MS_B=\frac{SS_B}{k-1},\quad MS_W=\frac{SS_W}{N-k}`,
  },
];

export function FormulaReference() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Formula reference</h1>
      <p className="text-slate-600 dark:text-slate-300">
        Symbols follow common textbook conventions: μ for population mean, σ for population standard deviation,
        s for sample standard deviation, and df for degrees of freedom.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        {blocks.map((b) => (
          <section key={b.title} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{b.title}</h2>
            <FormulaBlock tex={b.tex} />
          </section>
        ))}
      </div>
    </div>
  );
}
