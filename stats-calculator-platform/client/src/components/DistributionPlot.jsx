import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/**
 * Plots PDF curve with rejection shading and markers for critical values and test statistic.
 */
export function DistributionPlot({ plot, alternative = 'two-sided' }) {
  if (!plot?.curve?.points?.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">No plot data for this result.</p>
    );
  }

  const { points } = plot.curve;
  const cLow = plot.criticalLow;
  const cHigh = plot.criticalHigh;
  const ts = plot.testStat;
  const family = plot.curve.family;

  const data = points.map((p) => {
    const x = p.x;
    let rejectY = 0;
    if (family === 'z' || family === 't') {
      if (alternative === 'two-sided') {
        if (cLow != null && x <= cLow) rejectY = p.y;
        if (cHigh != null && x >= cHigh) rejectY = p.y;
      } else if (alternative === 'less') {
        if (cLow != null && x <= cLow) rejectY = p.y;
      } else if (alternative === 'greater') {
        if (cHigh != null && x >= cHigh) rejectY = p.y;
      }
    } else {
      if (cHigh != null && x >= cHigh) rejectY = p.y;
    }

    let pvalY = 0;
    if (family === 'z' || family === 't') {
      if (alternative === 'two-sided' && ts != null) {
        if (ts < 0 && x <= ts) pvalY = p.y;
        if (ts >= 0 && x >= ts) pvalY = p.y;
      } else if (alternative === 'less' && ts != null && x <= ts) pvalY = p.y;
      else if (alternative === 'greater' && ts != null && x >= ts) pvalY = p.y;
    } else if (ts != null && x >= ts) pvalY = p.y;

    return { x, y: p.y, rejectY, pvalY };
  });

  const xLabel = plot.curve.xLabel || 'x';

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-600" />
          <XAxis
            dataKey="x"
            type="number"
            domain={['dataMin', 'dataMax']}
            tick={{ fontSize: 11 }}
            label={{ value: xLabel, position: 'insideBottom', offset: -4, fontSize: 12 }}
          />
          <YAxis tick={{ fontSize: 11 }} width={36} />
          <Tooltip
            formatter={(v, name) => [v?.toFixed ? v.toFixed(4) : v, name]}
            labelFormatter={(l) => `${xLabel} = ${Number(l).toFixed(3)}`}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="rejectY"
            name="Rejection (under curve)"
            fill="#fca5a5"
            stroke="none"
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="pvalY"
            name="p-value tail"
            fill="#93c5fd"
            stroke="none"
            isAnimationActive={false}
          />
          <Line type="monotone" dataKey="y" name="Density" stroke="#0f172a" dot={false} strokeWidth={2} />
          {cLow != null && (
            <ReferenceLine
              x={cLow}
              stroke="#b91c1c"
              strokeDasharray="4 4"
              label={{ value: 'Crit.', fill: '#b91c1c', fontSize: 10 }}
            />
          )}
          {cHigh != null && (
            <ReferenceLine
              x={cHigh}
              stroke="#b91c1c"
              strokeDasharray="4 4"
              label={{ value: 'Crit.', fill: '#b91c1c', fontSize: 10 }}
            />
          )}
          {ts != null && (
            <ReferenceLine
              x={ts}
              stroke="#15803d"
              label={{ value: 'Test stat', fill: '#15803d', fontSize: 10 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
