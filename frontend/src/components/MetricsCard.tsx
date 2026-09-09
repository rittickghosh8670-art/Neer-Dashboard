interface Props {
  label: string;
  value: string;
  positive?: boolean;
  negative?: boolean;
}

function MetricsCard({ label, value, positive, negative }: Props) {
  const valueClass = positive ? 'metric-positive' : negative ? 'metric-negative' : '';

  return (
    <div className="metrics-card">
      <span className="metrics-card-label">{label}</span>
      <span className={`metrics-card-value ${valueClass}`}>{value}</span>
    </div>
  );
}

export default MetricsCard;
