import jstat from 'jstat';

/** Standard normal CDF table: rows 0.0–3.4 step 0.1, cols 0.00–0.09 */
export function buildZTableRows() {
  const rows = [];
  for (let i = 0; i <= 34; i++) {
    const z0 = i / 10;
    const cells = [];
    for (let j = 0; j < 10; j++) {
      const z = z0 + j / 100;
      cells.push({ z: z.toFixed(2), p: jstat.normal.cdf(z, 0, 1).toFixed(4) });
    }
    rows.push({ label: z0.toFixed(1), cells });
  }
  return rows;
}

/** Upper-tail critical |t| for common two-sided α (symmetric) */
export function buildTTableRows() {
  const dfs = [];
  for (let d = 1; d <= 40; d++) dfs.push(d);
  for (const d of [45, 50, 60, 80, 100, 120]) dfs.push(d);
  const alphas = [
    { key: '0.10', p: 0.95, tag: '90% conf (two-sided α=0.10)' },
    { key: '0.05', p: 0.975, tag: '95% conf (α=0.05)' },
    { key: '0.02', p: 0.99, tag: '' },
    { key: '0.01', p: 0.995, tag: '99% conf (α=0.01)' },
  ];
  return dfs.map((df) => {
    const row = { df };
    for (const a of alphas) {
      row[`a_${a.key}`] = jstat.studentt.inv(a.p, df).toFixed(3);
    }
    return row;
  });
}

export const T_ALPHA_HEADERS = [
  { field: 'a_0.10', label: 'α=0.10', highlight: true },
  { field: 'a_0.05', label: 'α=0.05', highlight: true },
  { field: 'a_0.02', label: 'α=0.02', highlight: false },
  { field: 'a_0.01', label: 'α=0.01', highlight: true },
];

export function buildChiSquareRows() {
  const dfs = [];
  for (let d = 1; d <= 30; d++) dfs.push(d);
  const cols = [
    { key: 'p995', p: 0.995 },
    { key: 'p99', p: 0.99 },
    { key: 'p975', p: 0.975 },
    { key: 'p95', p: 0.95 },
    { key: 'p90', p: 0.9 },
    { key: 'p50', p: 0.5 },
    { key: 'p10', p: 0.1 },
    { key: 'p05', p: 0.05 },
    { key: 'p025', p: 0.025 },
    { key: 'p01', p: 0.01 },
    { key: 'p005', p: 0.005 },
  ];
  return dfs.map((df) => {
    const row = { df };
    cols.forEach(({ key, p }) => {
      row[key] = jstat.chisquare.inv(p, df).toFixed(3);
    });
    return row;
  });
}

export const CHI_COLUMN_DEFS = [
  { field: 'p995', label: '0.995', highlight: false },
  { field: 'p99', label: '0.99', highlight: false },
  { field: 'p975', label: '0.975', highlight: true },
  { field: 'p95', label: '0.95 (α=0.05)', highlight: true },
  { field: 'p90', label: '0.90', highlight: false },
  { field: 'p50', label: '0.50', highlight: false },
  { field: 'p10', label: '0.10', highlight: false },
  { field: 'p05', label: '0.05', highlight: false },
  { field: 'p025', label: '0.025', highlight: true },
  { field: 'p01', label: '0.01', highlight: true },
  { field: 'p005', label: '0.005', highlight: false },
];

/** Compact F critical values F_{0.95}(df1,df2) upper 5% */
export function buildFTableRows() {
  const df1s = [1, 2, 3, 4, 5, 6, 8, 10, 12];
  const df2s = [5, 10, 12, 15, 20, 24, 30, 40, 60, 120];
  return df1s.map((d1) => {
    const row = { df1: d1 };
    df2s.forEach((d2) => {
      row[`d_${d2}`] = jstat.centralF.inv(0.95, d1, d2).toFixed(3);
    });
    return row;
  });
}

export const F_DF2_HEADERS = [5, 10, 12, 15, 20, 24, 30, 40, 60, 120].map((d) => ({
  field: `d_${d}`,
  label: `df₂=${d}`,
  highlight: d === 10 || d === 20,
}));
