import jstat from 'jstat';

/** Standard normal PDF */
function dnorm(x) {
  return jstat.normal.pdf(x, 0, 1);
}

/** t PDF (jstat) */
function dt(x, df) {
  return jstat.studentt.pdf(x, df);
}

/** Chi-square PDF */
function dchisq(x, df) {
  return jstat.chisquare.pdf(x, df);
}

/** F PDF */
function dfDist(x, d1, d2) {
  return jstat.centralF.pdf(x, d1, d2);
}

/**
 * Builds points for a normal curve (standard or scaled to test stat scale).
 * @param {'z'|'t'|'chisq'|'f'} family
 */
export function buildCurvePoints(family, params, options = {}) {
  const { n = 200 } = options;
  const points = [];

  if (family === 'z') {
    const from = -4;
    const to = 4;
    for (let i = 0; i <= n; i++) {
      const x = from + ((to - from) * i) / n;
      points.push({ x, y: dnorm(x) });
    }
    return { family: 'z', points, xLabel: 'z' };
  }

  if (family === 't') {
    const df = params.df ?? 10;
    const span = Math.max(4, jstat.studentt.inv(0.995, df) * 1.1);
    const from = -span;
    const to = span;
    for (let i = 0; i <= n; i++) {
      const x = from + ((to - from) * i) / n;
      points.push({ x, y: dt(x, df) });
    }
    return { family: 't', df, points, xLabel: 't' };
  }

  if (family === 'chisq') {
    const df = params.df ?? 4;
    const hi = Math.max(df * 3, jstat.chisquare.inv(0.999, df) * 1.05);
    const from = 0.001;
    const to = hi;
    for (let i = 0; i <= n; i++) {
      const x = from + ((to - from) * i) / n;
      points.push({ x, y: dchisq(x, df) });
    }
    return { family: 'chisq', df, points, xLabel: String.raw`\chi^2` };
  }

  if (family === 'f') {
    const d1 = params.df1 ?? 3;
    const d2 = params.df2 ?? 20;
    const hi = Math.max(5, jstat.centralF.inv(0.999, d1, d2) * 1.1);
    const from = 0.001;
    const to = hi;
    for (let i = 0; i <= n; i++) {
      const x = from + ((to - from) * i) / n;
      points.push({ x, y: dfDist(x, d1, d2) });
    }
    return { family: 'f', df1: d1, df2: d2, points, xLabel: 'F' };
  }

  return { family: 'unknown', points: [], xLabel: '' };
}

/**
 * Tail shading intervals for visualization (x ranges to fill under curve).
 */
export function tailShadeIntervals({
  family,
  df,
  df1,
  df2,
  alternative,
  criticalLow,
  criticalHigh,
  testStat,
}) {
  const intervals = [];
  // Rejection regions (outside acceptance)
  if (family === 'z' || family === 't') {
    if (alternative === 'two-sided') {
      if (criticalLow != null) intervals.push({ type: 'reject', from: -8, to: criticalLow });
      if (criticalHigh != null) intervals.push({ type: 'reject', from: criticalHigh, to: 8 });
      if (testStat != null) {
        if (testStat < 0) intervals.push({ type: 'pvalue', from: -8, to: testStat });
        else intervals.push({ type: 'pvalue', from: testStat, to: 8 });
      }
    } else if (alternative === 'less') {
      if (criticalLow != null) intervals.push({ type: 'reject', from: -8, to: criticalLow });
      if (testStat != null) intervals.push({ type: 'pvalue', from: -8, to: testStat });
    } else {
      if (criticalHigh != null) intervals.push({ type: 'reject', from: criticalHigh, to: 8 });
      if (testStat != null) intervals.push({ type: 'pvalue', from: testStat, to: 8 });
    }
  } else if (family === 'chisq' || family === 'f') {
    const hi = family === 'chisq' ? jstat.chisquare.inv(0.9995, df) : jstat.centralF.inv(0.9995, df1, df2);
    if (alternative === 'two-sided') {
      if (criticalLow != null) intervals.push({ type: 'reject', from: 0, to: criticalLow });
      if (criticalHigh != null) intervals.push({ type: 'reject', from: criticalHigh, to: hi });
    } else {
      if (criticalHigh != null) intervals.push({ type: 'reject', from: criticalHigh, to: hi });
      if (testStat != null && alternative === 'greater') {
        intervals.push({ type: 'pvalue', from: testStat, to: hi });
      }
    }
  }
  return intervals;
}
