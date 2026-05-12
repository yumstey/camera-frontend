import '../styles/statcard.css';

function formatValue(value) {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000)     return Math.round(value / 1000) + 'K';
  return value.toLocaleString();
}

export default function StatCard({ label, value, change }) {
  const isPositive = change >= 0;

  return (

    <div className="stat-card">
      <p className="stat-card__label">{label}</p>
      <div className="stat-card__value-row">
        <span className="stat-card__value">{formatValue(value)}</span>
      </div>
    </div>
  );
}
