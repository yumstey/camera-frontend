import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import '../styles/charts.css';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  return (
    <div className="custom-tooltip">
      {d.name}: {d.value}%
    </div>
  );
}

export default function TrafficGenderChart({ data = {}, title = 'Трафик по категориям' }) {
  const [tab, setTab] = useState('weekly');

  const tabData = data?.[tab] || [];
  const known = tabData.filter((d) => d.name !== 'Unknown');
  const total = known.reduce((s, d) => s + d.value, 0);
  const largest = known.reduce((a, b) => (a.value > b.value ? a : b), { name: '', value: 0 });

  console.log(tabData)
  return (
    <div className="chart-card">

      <div className="chart-card__header">
        <h3 className="chart-card__title">{title}</h3>

        <div className="peak-tabs">
          {['weekly', 'monthly'].map(t => (
            <button
              key={t}
              className={`peak-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'weekly' ? 'Неделя' : 'Месяц'}
            </button>
          ))}
        </div>
      </div>

      <div className="gender-layout">

        <div className="gender-donut-wrap">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={tabData}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {tabData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>

              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="gender-donut-center">
            <span className="gender-donut-pct">{largest.value}%</span>
            <span className="gender-donut-lbl">{largest.name}</span>
          </div>
        </div>

        <div className="gender-legend">
          {known.map((item) => (
            <div key={item.name} className="gender-legend__item">

              <div className="gender-legend__left">
                <span
                  className="gender-legend__dot"
                  style={{ background: item.color }}
                />
                <span className="gender-legend__icon">{item.name}</span>
              </div>

              <span className="gender-legend__pct">{item.value}%</span>
            </div>
          ))}

          <div className="gender-total">
            Определено: <strong>{total.toFixed(1)}%</strong>
          </div>
        </div>

      </div>
    </div>
  );
}