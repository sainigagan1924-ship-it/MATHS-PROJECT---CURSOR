export function About() {
  return (
    <article className="prose prose-slate max-w-none dark:prose-invert">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">About statistics &amp; this tool</h1>
      <p>
        This platform helps you carry out common inferential procedures: hypothesis tests for means, chi-square
        tests for association, and one-way ANOVA. Each calculator shows the formula, intermediate steps, a
        numeric check using the{' '}
        <a href="https://jstat.github.io/" className="text-brand-600 hover:underline" target="_blank" rel="noreferrer">
          jStat
        </a>{' '}
        library, and a plot of the reference distribution with critical values and your test statistic.
      </p>
      <h2 className="text-xl font-semibold">Significance and errors</h2>
      <p>
        The significance level α is the probability of rejecting a true null hypothesis (Type I error). The
        p-value is the smallest α at which you would reject given your observed statistic. Compare p to α for a
        decision rule equivalent to the critical-value rule.
      </p>
      <h2 className="text-xl font-semibold">Assumptions</h2>
      <p>
        Parametric tests assume appropriate sampling (often independence), correct model (e.g. normal data or
        large samples for many mean procedures), and for two-sample t-tests you may assume equal or unequal
        variances. Always relate results to the context of your study.
      </p>
    </article>
  );
}
