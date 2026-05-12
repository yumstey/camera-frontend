import "../styles/statcard.css";

export default function StatCard({ label, value }) {
  return (
    <div className="stat-card">
      <p className="stat-card__label">{label}</p>
      <div className="stat-card__value-row">
        <span className="stat-card__value">{Math.round(value)}</span>
      </div>
    </div>
  );
}
