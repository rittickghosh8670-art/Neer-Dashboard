import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { EquityPoint } from '../types/metrics';

interface Props {
  data: EquityPoint[];
}

function EquityCurve({ data }: Props) {
  if (data.length === 0) {
    return <p className="empty-state">No closed trades yet.</p>;
  }

  const chartData = data.map((p, i) => ({
    index: i + 1,
    pnl: p.cumulativePnl,
    date: new Date(p.date).toLocaleDateString(),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#262a36" />
        <XAxis dataKey="index" stroke="#9aa4b2" fontSize={12} />
        <YAxis stroke="#9aa4b2" fontSize={12} />
        <Tooltip
          contentStyle={{ background: '#161822', border: '1px solid #262a36', borderRadius: 8 }}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.date ?? ''}
          formatter={(value: number) => [value.toFixed(2), 'Cumulative PnL']}
        />
        <Line type="monotone" dataKey="pnl" stroke="#4a9eff" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default EquityCurve;
