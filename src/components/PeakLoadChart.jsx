import { useState } from 'react';
import {
    ResponsiveContainer, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import '../styles/charts.css';

function fmt(val) {
    if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
    return val;
}

function StatPill({ label, value, color }) {
    return (
        <div className="peak-stat">
            <span className="peak-stat__dot" style={{ background: color }} />
            <span className="peak-stat__label">{label}</span>
            <span className="peak-stat__value">{fmt(value)}</span>
        </div>
    );
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="custom-tooltip" style={{ minWidth: 130 }}>
            <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 12 }}>
                {typeof label === 'number' ? `День ${label}` : label}
            </div>
            {payload.map((p) => (
                <div
                    key={p.dataKey}
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        fontSize: 12
                    }}
                >
                    <span style={{ color: p.fill, fontWeight: 600 }}>{p.name}</span>
                    <span>{new Intl.NumberFormat().format(p.value)}</span>
                </div>
            ))}
        </div>
    );
}

export default function PeakLoadChart({ data }) {
    const [tab, setTab] = useState('weekly'); // 'weekly' | 'monthly'

    const chartData = data?.[tab] || [];
    const maxVal = chartData.length ? Math.max(...chartData.map(d => d.max)) : 0;
    const minVal = chartData.length ? Math.min(...chartData.map(d => d.min)) : 0;
    const avgVal = chartData.length
        ? Math.round(chartData.reduce((s, d) => s + d.avg, 0) / chartData.length)
        : 0;

    const xKey = tab === 'weekly' ? 'day' : 'day';

    const tickFormatter = tab === 'monthly'
        ? (val) => (val % 5 === 1 || val === 30 ? val : '')
        : undefined;

    return (
        <div className="chart-card">
            <div className="chart-card__header">
                <div>
                    <h3 className="chart-card__title">Пиковая нагрузка</h3>
                    <p className="chart-card__subtitle">
                        Количество посетителей — мин / сред / макс
                    </p>
                </div>

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

            <div className="peak-stats-row">
                <StatPill label="Макс" value={maxVal} color="#1a1d23" />
                <StatPill label="Сред" value={avgVal} color="#4a90d9" />
                <StatPill label="Мин" value={minVal} color="#7ec87e" />
            </div>

            <ResponsiveContainer width="100%" height={190}>
                <BarChart
                    data={chartData}
                    margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                    barGap={1}
                    barCategoryGap={tab === 'monthly' ? '20%' : '35%'}
                >
                    <CartesianGrid vertical={false} stroke="rgba(60,60,67,0.07)" strokeDasharray="0" />

                    <XAxis
                        dataKey={xKey}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={tickFormatter}
                        tick={{ fontSize: 10.5, fill: '#aeaeb2', fontFamily: 'var(--font)' }}
                    />

                    <YAxis
                        tickFormatter={fmt}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10.5, fill: '#aeaeb2', fontFamily: 'var(--font)' }}
                        width={38}
                    />

                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />

                    <Bar dataKey="max" name="Макс" fill="#1a1d23" radius={[3,3,0,0]}
                         barSize={tab === 'monthly' ? 4 : 10} />
                    <Bar dataKey="avg" name="Сред" fill="#4a90d9" radius={[3,3,0,0]}
                         barSize={tab === 'monthly' ? 4 : 10} />
                    <Bar dataKey="min" name="Мин" fill="#7ec87e" radius={[3,3,0,0]}
                         barSize={tab === 'monthly' ? 4 : 10} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}