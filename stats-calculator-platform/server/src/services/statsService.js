import jstat from 'jstat';
import { buildCurvePoints, tailShadeIntervals } from './distributionPlots.js';

const TEST_IDS = new Set([
  'hypothesis-testing-1',
  'hypothesis-testing-2',
  'hypothesis-testing-3',
  'z-test-one-sample',
  'z-test-two-sample',
  't-test-one-sample',
  't-test-two-sample',
  't-test-paired',
  'chi-square-test',
  'anova',
]);

function num(v, name) {
  const x = typeof v === 'string' ? parseFloat(v) : v;
  if (Number.isNaN(x) || !Number.isFinite(x)) throw new Error(`Invalid number for ${name}`);
  return x;
}

function positiveInt(v, name) {
  const n = Math.round(num(v, name));
  if (n < 1) throw new Error(`${name} must be a positive integer`);
  return n;
}

function parseList(str) {
  if (Array.isArray(str)) return str.map((s) => num(s, 'data value'));
  return String(str)
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map((s) => num(s, 'data value'));
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function sampleStd(arr) {
  const m = mean(arr);
  const v = arr.reduce((s, x) => s + (x - m) ** 2, 0) / (arr.length - 1);
  return Math.sqrt(v);
}

function round(x, d = 6) {
  const p = 10 ** d;
  return Math.round(x * p) / p;
}

/** p-value for Z normal test */
function pValueZ(z, alternative) {
  if (alternative === 'two-sided') return 2 * (1 - jstat.normal.cdf(Math.abs(z), 0, 1));
  if (alternative === 'less') return jstat.normal.cdf(z, 0, 1);
  return 1 - jstat.normal.cdf(z, 0, 1);
}

function pValueT(t, df, alternative) {
  if (alternative === 'two-sided') return 2 * (1 - jstat.studentt.cdf(Math.abs(t), df));
  if (alternative === 'less') return jstat.studentt.cdf(t, df);
  return 1 - jstat.studentt.cdf(t, df);
}

function pValueChiSq(chi2, df) {
  return 1 - jstat.chisquare.cdf(chi2, df);
}

function pValueF(F, d1, d2) {
  return 1 - jstat.centralF.cdf(F, d1, d2);
}

function criticalZ(alpha, alternative) {
  if (alternative === 'two-sided') {
    const zc = jstat.normal.inv(1 - alpha / 2, 0, 1);
    return { low: -zc, high: zc };
  }
  if (alternative === 'less') return { low: jstat.normal.inv(alpha, 0, 1), high: null };
  return { low: null, high: jstat.normal.inv(1 - alpha, 0, 1) };
}

function criticalT(alpha, df, alternative) {
  if (alternative === 'two-sided') {
    const tc = jstat.studentt.inv(1 - alpha / 2, df);
    return { low: -tc, high: tc };
  }
  if (alternative === 'less') return { low: jstat.studentt.inv(alpha, df), high: null };
  return { low: null, high: jstat.studentt.inv(1 - alpha, df) };
}

function criticalChiSq(alpha, df) {
  return { low: null, high: jstat.chisquare.inv(1 - alpha, df) };
}

function criticalF(alpha, d1, d2) {
  return { low: null, high: jstat.centralF.inv(1 - alpha, d1, d2) };
}

function regionText(alternative, crit, distLabel = 'test statistic') {
  if (alternative === 'two-sided') {
    return `Reject H₀ if ${distLabel} < ${round(crit.low)} or ${distLabel} > ${round(crit.high)}. Accept otherwise (within [${round(crit.low)}, ${round(crit.high)}]).`;
  }
  if (alternative === 'less') {
    return `Reject H₀ if ${distLabel} < ${round(crit.low)}. Accept if ${distLabel} ≥ ${round(crit.low)}.`;
  }
  return `Reject H₀ if ${distLabel} > ${round(crit.high)}. Accept if ${distLabel} ≤ ${round(crit.high)}.`;
}

function interpret(p, alpha) {
  if (p < alpha) return `Because p-value (${round(p, 4)}) < α (${alpha}), reject H₀ at significance level α.`;
  return `Because p-value (${round(p, 4)}) ≥ α (${alpha}), fail to reject H₀ at significance level α.`;
}

function oneSampleZ(body) {
  const xbar = num(body.sampleMean, 'sampleMean');
  const mu0 = num(body.hypothesizedMean, 'hypothesizedMean');
  const sigma = num(body.populationStd, 'populationStd');
  const n = positiveInt(body.sampleSize, 'sampleSize');
  const alpha = num(body.alpha ?? body.significanceLevel ?? 0.05, 'alpha');
  const alternative = body.alternative || 'two-sided';

  const se = sigma / Math.sqrt(n);
  const z = (xbar - mu0) / se;
  const crit = criticalZ(alpha, alternative);
  const p = pValueZ(z, alternative);
  const reject =
    (alternative === 'two-sided' && (z < crit.low || z > crit.high)) ||
    (alternative === 'less' && z < crit.low) ||
    (alternative === 'greater' && z > crit.high);

  const manualSteps = [
    `Standard error: SE = σ/√n = ${sigma}/√${n} = ${round(se)}`,
    `Test statistic: z = (x̄ − μ₀)/SE = (${xbar} − ${mu0})/${round(se)} = ${round(z)}`,
    `Critical value(s): ${crit.low != null ? round(crit.low) : '—'} , ${crit.high != null ? round(crit.high) : '—'}`,
    `p-value (from standard normal): ${round(p)}`,
  ];

  const library = {
    method: 'jstat.normal.cdf',
    pValue: round(pValueZ(z, alternative)),
    critical: crit,
  };

  const plot = {
    curve: buildCurvePoints('z', {}),
    criticalLow: crit.low,
    criticalHigh: crit.high,
    testStat: z,
    shade: tailShadeIntervals({
      family: 'z',
      alternative,
      criticalLow: crit.low,
      criticalHigh: crit.high,
      testStat: z,
    }),
  };

  return {
    testId: 'z-test-one-sample',
    formula: String.raw`z = \frac{\bar{x} - \mu_0}{\sigma/\sqrt{n}}`,
    manualSteps,
    library,
    testStatistic: round(z),
    criticalValue: crit,
    pValue: round(p),
    reject,
    rejectionRegion: regionText(alternative, crit, 'z'),
    interpretation: interpret(p, alpha),
    conclusion: reject
      ? 'There is sufficient evidence to reject the null hypothesis.'
      : 'There is not sufficient evidence to reject the null hypothesis.',
    parameters: { xbar, mu0, sigma, n, alpha, alternative },
    plot,
  };
}

function twoSampleZ(body) {
  const x1 = num(body.mean1, 'mean1');
  const x2 = num(body.mean2, 'mean2');
  const s1 = num(body.std1, 'std1');
  const s2 = num(body.std2, 'std2');
  const n1 = positiveInt(body.n1, 'n1');
  const n2 = positiveInt(body.n2, 'n2');
  const d0 = num(body.hypothesizedDiff ?? 0, 'hypothesizedDiff');
  const alpha = num(body.alpha ?? 0.05, 'alpha');
  const alternative = body.alternative || 'two-sided';

  const se = Math.sqrt((s1 * s1) / n1 + (s2 * s2) / n2);
  const z = (x1 - x2 - d0) / se;
  const crit = criticalZ(alpha, alternative);
  const p = pValueZ(z, alternative);
  const reject =
    (alternative === 'two-sided' && (z < crit.low || z > crit.high)) ||
    (alternative === 'less' && z < crit.low) ||
    (alternative === 'greater' && z > crit.high);

  const manualSteps = [
    `SE = √(σ₁²/n₁ + σ₂²/n₂) = √(${s1}²/${n1} + ${s2}²/${n2}) = ${round(se)}`,
    `z = ((x̄₁ − x̄₂) − D₀)/SE = ((${x1} − ${x2}) − ${d0})/${round(se)} = ${round(z)}`,
    `Critical z: low=${crit.low != null ? round(crit.low) : '—'}, high=${crit.high != null ? round(crit.high) : '—'}`,
    `p-value: ${round(p)}`,
  ];

  return {
    testId: 'z-test-two-sample',
    formula: String.raw`z = \frac{(\bar{x}_1 - \bar{x}_2) - D_0}{\sqrt{\sigma_1^2/n_1 + \sigma_2^2/n_2}}`,
    manualSteps,
    library: { method: 'jstat.normal.cdf', pValue: round(p), critical: crit },
    testStatistic: round(z),
    criticalValue: crit,
    pValue: round(p),
    reject,
    rejectionRegion: regionText(alternative, crit, 'z'),
    interpretation: interpret(p, alpha),
    conclusion: reject
      ? 'Reject H₀: means differ beyond chance at α.'
      : 'Fail to reject H₀.',
    parameters: { x1, x2, s1, s2, n1, n2, d0, alpha, alternative },
    plot: {
      curve: buildCurvePoints('z', {}),
      criticalLow: crit.low,
      criticalHigh: crit.high,
      testStat: z,
      shade: tailShadeIntervals({
        family: 'z',
        alternative,
        criticalLow: crit.low,
        criticalHigh: crit.high,
        testStat: z,
      }),
    },
  };
}

function oneSampleT(body) {
  const data = parseList(body.data ?? body.values);
  const mu0 = num(body.hypothesizedMean, 'hypothesizedMean');
  const alpha = num(body.alpha ?? 0.05, 'alpha');
  const alternative = body.alternative || 'two-sided';
  const n = data.length;
  if (n < 2) throw new Error('Need at least 2 data points for one-sample t-test');
  const xbar = mean(data);
  const s = sampleStd(data);
  const se = s / Math.sqrt(n);
  const df = n - 1;
  const t = (xbar - mu0) / se;
  const crit = criticalT(alpha, df, alternative);
  const p = pValueT(t, df, alternative);
  const reject =
    (alternative === 'two-sided' && (t < crit.low || t > crit.high)) ||
    (alternative === 'less' && t < crit.low) ||
    (alternative === 'greater' && t > crit.high);

  const manualSteps = [
    `n = ${n}, x̄ = ${round(xbar)}, s = ${round(s)}`,
    `SE = s/√n = ${round(s)}/√${n} = ${round(se)}`,
    `t = (x̄ − μ₀)/SE = (${round(xbar)} − ${mu0})/${round(se)} = ${round(t)}, df = ${df}`,
    `Critical t: ${crit.low != null ? round(crit.low) : '—'}, ${crit.high != null ? round(crit.high) : '—'}`,
    `p-value: ${round(p)}`,
  ];

  return {
    testId: 't-test-one-sample',
    formula: String.raw`t = \frac{\bar{x} - \mu_0}{s/\sqrt{n}},\quad df = n-1`,
    manualSteps,
    library: { method: 'jstat.studentt.cdf', pValue: round(p), df },
    testStatistic: round(t),
    criticalValue: { ...crit, df },
    pValue: round(p),
    reject,
    rejectionRegion: regionText(alternative, crit, 't'),
    interpretation: interpret(p, alpha),
    conclusion: reject ? 'Reject H₀.' : 'Fail to reject H₀.',
    parameters: { n, xbar, s, mu0, df, alpha, alternative },
    plot: {
      curve: buildCurvePoints('t', { df }),
      criticalLow: crit.low,
      criticalHigh: crit.high,
      testStat: t,
      shade: tailShadeIntervals({
        family: 't',
        df,
        alternative,
        criticalLow: crit.low,
        criticalHigh: crit.high,
        testStat: t,
      }),
    },
  };
}

function twoSampleT(body) {
  const data1 = parseList(body.data1 ?? body.group1);
  const data2 = parseList(body.data2 ?? body.group2);
  const pooled =
    body.variance === 'welch' || body.variance === 'unequal'
      ? false
      : body.variance === 'pooled' || body.equalVariance === true || body.variance == null;
  const alpha = num(body.alpha ?? 0.05, 'alpha');
  const alternative = body.alternative || 'two-sided';
  const d0 = num(body.hypothesizedDiff ?? 0, 'hypothesizedDiff');
  const n1 = data1.length;
  const n2 = data2.length;
  if (n1 < 2 || n2 < 2) throw new Error('Each group needs at least 2 observations');

  const m1 = mean(data1);
  const m2 = mean(data2);
  const s1 = sampleStd(data1);
  const s2 = sampleStd(data2);

  let t;
  let df;
  let se;
  let manualSteps;

  if (pooled) {
    const sp2 =
      ((n1 - 1) * s1 * s1 + (n2 - 1) * s2 * s2) / (n1 + n2 - 2);
    se = Math.sqrt(sp2 * (1 / n1 + 1 / n2));
    df = n1 + n2 - 2;
    t = (m1 - m2 - d0) / se;
    manualSteps = [
      `Pooled variance: s_p² = [(${n1}-1)s₁² + (${n2}-1)s₂²]/(n₁+n₂-2) = ${round(sp2)}`,
      `SE = √(s_p²(1/n₁ + 1/n₂)) = ${round(se)}`,
      `t = ((x̄₁ − x̄₂) − D₀)/SE = ${round(t)}, df = ${df}`,
    ];
  } else {
    const v1 = (s1 * s1) / n1;
    const v2 = (s2 * s2) / n2;
    se = Math.sqrt(v1 + v2);
    t = (m1 - m2 - d0) / se;
    const nume = (v1 + v2) ** 2;
    const deno = v1 ** 2 / (n1 - 1) + v2 ** 2 / (n2 - 1);
    df = nume / deno;
    manualSteps = [
      `Welch–Satterthwaite df = ${round(df)}`,
      `SE = √(s₁²/n₁ + s₂²/n₂) = ${round(se)}`,
      `t = ${round(t)}`,
    ];
  }

  const crit = criticalT(alpha, df, alternative);
  const p = pValueT(t, df, alternative);
  const reject =
    (alternative === 'two-sided' && (t < crit.low || t > crit.high)) ||
    (alternative === 'less' && t < crit.low) ||
    (alternative === 'greater' && t > crit.high);

  manualSteps.push(`Critical t: ${crit.low != null ? round(crit.low) : '—'}, ${crit.high != null ? round(crit.high) : '—'}`);
  manualSteps.push(`p-value: ${round(p)}`);

  return {
    testId: 't-test-two-sample',
    formula: pooled
      ? String.raw`t = \frac{(\bar{x}_1-\bar{x}_2)-D_0}{s_p\sqrt{1/n_1+1/n_2}},\quad s_p^2 = \frac{(n_1-1)s_1^2+(n_2-1)s_2^2}{n_1+n_2-2}`
      : String.raw`t = \frac{(\bar{x}_1-\bar{x}_2)-D_0}{\sqrt{s_1^2/n_1+s_2^2/n_2}}\quad\text{(Welch)}`,
    manualSteps,
    library: { method: 'jstat.studentt.cdf', pValue: round(p), df: round(df, 4), pooled },
    testStatistic: round(t),
    criticalValue: { ...crit, df: round(df, 4) },
    pValue: round(p),
    reject,
    rejectionRegion: regionText(alternative, crit, 't'),
    interpretation: interpret(p, alpha),
    conclusion: reject ? 'Reject H₀ (means differ).' : 'Fail to reject H₀.',
    parameters: { m1, m2, s1, s2, n1, n2, df: round(df, 4), pooled, alpha, alternative },
    plot: {
      curve: buildCurvePoints('t', { df }),
      criticalLow: crit.low,
      criticalHigh: crit.high,
      testStat: t,
      shade: tailShadeIntervals({
        family: 't',
        df,
        alternative,
        criticalLow: crit.low,
        criticalHigh: crit.high,
        testStat: t,
      }),
    },
  };
}

function pairedT(body) {
  const x = parseList(body.before ?? body.x);
  const y = parseList(body.after ?? body.y);
  if (x.length !== y.length) throw new Error('Paired samples must have equal length');
  const d = x.map((xi, i) => xi - y[i]);
  const n = d.length;
  if (n < 2) throw new Error('Need at least 2 pairs');
  const db = mean(d);
  const sd = sampleStd(d);
  const se = sd / Math.sqrt(n);
  const df = n - 1;
  const t = db / se;
  const alpha = num(body.alpha ?? 0.05, 'alpha');
  const alternative = body.alternative || 'two-sided';
  const crit = criticalT(alpha, df, alternative);
  const p = pValueT(t, df, alternative);
  const reject =
    (alternative === 'two-sided' && (t < crit.low || t > crit.high)) ||
    (alternative === 'less' && t < crit.low) ||
    (alternative === 'greater' && t > crit.high);

  const manualSteps = [
    `Differences dᵢ = xᵢ − yᵢ (first few): ${d.slice(0, 5).map((v) => round(v)).join(', ')}${n > 5 ? ', …' : ''}`,
    `d̄ = ${round(db)}, s_d = ${round(sd)}, SE = ${round(se)}`,
    `t = d̄/(s_d/√n) = ${round(t)}, df = ${df}`,
    `p-value: ${round(p)}`,
  ];

  return {
    testId: 't-test-paired',
    formula: String.raw`t = \frac{\bar{d}}{s_d/\sqrt{n}},\quad df = n-1`,
    manualSteps,
    library: { method: 'jstat.studentt.cdf', pValue: round(p) },
    testStatistic: round(t),
    criticalValue: { ...crit, df },
    pValue: round(p),
    reject,
    rejectionRegion: regionText(alternative, crit, 't'),
    interpretation: interpret(p, alpha),
    conclusion: reject ? 'Reject H₀: mean difference ≠ 0.' : 'Fail to reject H₀.',
    parameters: { n, meanDiff: round(db), sd: round(sd), alpha, alternative },
    plot: {
      curve: buildCurvePoints('t', { df }),
      criticalLow: crit.low,
      criticalHigh: crit.high,
      testStat: t,
      shade: tailShadeIntervals({
        family: 't',
        df,
        alternative,
        criticalLow: crit.low,
        criticalHigh: crit.high,
        testStat: t,
      }),
    },
  };
}

/**
 * Chi-square test of independence for r×c contingency (counts as nested arrays or flat with rows/cols).
 */
function chiSquare(body) {
  let table = body.table;
  if (typeof table === 'string') {
    table = JSON.parse(table);
  }
  if (!Array.isArray(table) || !table.length) throw new Error('Provide contingency table as 2D array `table`');
  const rows = table.length;
  const cols = table[0].length;
  const flat = table.flat().map((c) => num(c, 'cell count'));
  if (flat.some((c) => c < 0)) throw new Error('Counts must be non-negative');
  const total = flat.reduce((a, b) => a + b, 0);
  const rowSum = table.map((r) => r.reduce((a, b) => a + num(b, 'cell'), 0));
  const colSum = [];
  for (let j = 0; j < cols; j++) {
    let s = 0;
    for (let i = 0; i < rows; i++) s += num(table[i][j], 'cell');
    colSum.push(s);
  }
  let chi2 = 0;
  const expected = [];
  const contrib = [];
  for (let i = 0; i < rows; i++) {
    expected[i] = [];
    contrib[i] = [];
    for (let j = 0; j < cols; j++) {
      const E = (rowSum[i] * colSum[j]) / total;
      const O = num(table[i][j], 'cell');
      expected[i][j] = E;
      const c = ((O - E) ** 2) / E;
      contrib[i][j] = c;
      chi2 += c;
    }
  }
  const df = (rows - 1) * (cols - 1);
  const alpha = num(body.alpha ?? 0.05, 'alpha');
  const crit = criticalChiSq(alpha, df);
  const p = pValueChiSq(chi2, df);
  const reject = chi2 > crit.high;

  const manualSteps = [
    `Expected E_ij = (row sum × col sum) / N for each cell`,
    `χ² = Σ (O−E)²/E = ${round(chi2)}, df = (r−1)(c−1) = ${df}`,
    `Critical χ²_{1-α,df} = ${round(crit.high)}`,
    `p-value = P(χ²_df > observed) = ${round(p)}`,
  ];

  return {
    testId: 'chi-square-test',
    formula: String.raw`\chi^2 = \sum \frac{(O_{ij}-E_{ij})^2}{E_{ij}},\quad E_{ij}=\frac{R_i C_j}{N}`,
    manualSteps,
    library: { method: 'jstat.chisquare.cdf', chiSq: round(chi2), df },
    testStatistic: round(chi2),
    criticalValue: crit,
    pValue: round(p),
    reject,
    rejectionRegion: `Reject H₀ if χ² > ${round(crit.high)} (upper tail, df=${df}).`,
    interpretation: interpret(p, alpha),
    conclusion: reject
      ? 'Reject independence: variables appear associated.'
      : 'Fail to reject independence.',
    parameters: { rows, cols, df, alpha, total },
    extras: { expected, contribution: contrib, rowSum, colSum },
    plot: {
      curve: buildCurvePoints('chisq', { df }),
      criticalLow: crit.low,
      criticalHigh: crit.high,
      testStat: chi2,
      shade: tailShadeIntervals({
        family: 'chisq',
        df,
        alternative: 'greater',
        criticalHigh: crit.high,
        testStat: chi2,
      }),
    },
  };
}

function oneWayAnova(body) {
  const groups = body.groups;
  if (!Array.isArray(groups) || groups.length < 2) {
    throw new Error('Provide `groups` as array of numeric arrays (k ≥ 2)');
  }
  const data = groups.map((g) => (Array.isArray(g) ? g : parseList(g)));
  const k = data.length;
  const ns = data.map((g) => g.length);
  if (ns.some((n) => n < 1)) throw new Error('Each group needs at least one value');
  const means = data.map((g) => mean(g));
  const N = ns.reduce((a, b) => a + b, 0);
  const grand = data.flat().reduce((s, x) => s + num(x, 'value'), 0) / N;

  let SSB = 0;
  for (let i = 0; i < k; i++) SSB += ns[i] * (means[i] - grand) ** 2;

  let SSW = 0;
  for (let i = 0; i < k; i++) {
    for (const x of data[i]) SSW += (num(x, 'value') - means[i]) ** 2;
  }

  const dfB = k - 1;
  const dfW = N - k;
  const MSB = SSB / dfB;
  const MSW = SSW / dfW;
  const F = MSB / MSW;
  const alpha = num(body.alpha ?? 0.05, 'alpha');
  const crit = criticalF(alpha, dfB, dfW);
  const p = pValueF(F, dfB, dfW);
  const reject = F > crit.high;

  const manualSteps = [
    `Grand mean x̄.. = ${round(grand)}`,
    `SSB = ${round(SSB)}, SSW = ${round(SSW)}`,
    `MSB = SSB/(k−1) = ${round(MSB)}, MSW = SSW/(N−k) = ${round(MSW)}`,
    `F = MSB/MSW = ${round(F)}, df₁=${dfB}, df₂=${dfW}`,
    `Critical F = ${round(crit.high)}, p-value = ${round(p)}`,
  ];

  return {
    testId: 'anova',
    formula: String.raw`F = \frac{MS_B}{MS_W},\quad MS_B=\frac{SS_B}{k-1},\ MS_W=\frac{SS_W}{N-k}`,
    manualSteps,
    library: { method: 'jstat.centralF.cdf', pValue: round(p) },
    testStatistic: round(F),
    criticalValue: { ...crit, df1: dfB, df2: dfW },
    pValue: round(p),
    reject,
    rejectionRegion: `Reject H₀ (equal means) if F > ${round(crit.high)}.`,
    interpretation: interpret(p, alpha),
    conclusion: reject ? 'Reject H₀: not all group means are equal.' : 'Fail to reject H₀: means may be equal.',
    parameters: { k, N, groupMeans: means.map((m) => round(m)), alpha },
    extras: { SSB: round(SSB), SSW: round(SSW), MSB: round(MSB), MSW: round(MSW) },
    plot: {
      curve: buildCurvePoints('f', { df1: dfB, df2: dfW }),
      criticalLow: crit.low,
      criticalHigh: crit.high,
      testStat: F,
      shade: tailShadeIntervals({
        family: 'f',
        df1: dfB,
        df2: dfW,
        alternative: 'greater',
        criticalHigh: crit.high,
        testStat: F,
      }),
    },
  };
}

/** Hypothesis testing 1: structured one-sample Z (σ known) with explicit H0/H1 narrative */
function hypothesis1(body) {
  const core = oneSampleZ(body);
  const h0 = body.h0Text?.trim() || `H₀: μ = ${body.hypothesizedMean}`;
  const h1 = body.h1Text?.trim() || `H₁: μ ≠ ${body.hypothesizedMean} (two-sided default)`;
  return {
    ...core,
    testId: 'hypothesis-testing-1',
    narrative: { h0, h1, steps: ['State hypotheses', 'Choose α and test (Z, σ known)', 'Compute statistic', 'Make decision'] },
    manualSteps: [`Hypotheses: ${h0}; ${h1}`, ...core.manualSteps],
  };
}

function hypothesis2(body) {
  const core = oneSampleT(body);
  const h0 = body.h0Text?.trim() || `H₀: μ = ${body.hypothesizedMean}`;
  const h1 = body.h1Text?.trim() || `H₁: μ ≠ ${body.hypothesizedMean}`;
  return {
    ...core,
    testId: 'hypothesis-testing-2',
    narrative: { h0, h1, steps: ['State hypotheses', 'Choose α (σ unknown → t-test)', 'Compute t', 'Compare to critical t / p-value'] },
    manualSteps: [`Hypotheses: ${h0}; ${h1}`, ...core.manualSteps],
  };
}

function hypothesis3(body) {
  const core = twoSampleT(body);
  const h0 = body.h0Text?.trim() || 'H₀: μ₁ = μ₂';
  const h1 = body.h1Text?.trim() || 'H₁: μ₁ ≠ μ₂';
  return {
    ...core,
    testId: 'hypothesis-testing-3',
    narrative: { h0, h1, steps: ['State hypotheses for two populations', 'Choose α', 'Independent samples t', 'Decision'] },
    manualSteps: [`Hypotheses: ${h0}; ${h1}`, ...core.manualSteps],
  };
}

export function runCalculation(testId, body) {
  if (!TEST_IDS.has(testId)) throw Object.assign(new Error('Unknown test'), { status: 400 });

  let result;
  switch (testId) {
    case 'hypothesis-testing-1':
      result = hypothesis1(body);
      break;
    case 'hypothesis-testing-2':
      result = hypothesis2(body);
      break;
    case 'hypothesis-testing-3':
      result = hypothesis3(body);
      break;
    case 'z-test-one-sample':
      result = oneSampleZ(body);
      break;
    case 'z-test-two-sample':
      result = twoSampleZ(body);
      break;
    case 't-test-one-sample':
      result = oneSampleT(body);
      break;
    case 't-test-two-sample':
      result = twoSampleT(body);
      break;
    case 't-test-paired':
      result = pairedT(body);
      break;
    case 'chi-square-test':
      result = chiSquare(body);
      break;
    case 'anova':
      result = oneWayAnova(body);
      break;
    default:
      throw Object.assign(new Error('Unknown test'), { status: 400 });
  }

  return {
    ok: true,
    testId,
    computedAt: new Date().toISOString(),
    result,
  };
}

export { TEST_IDS };
