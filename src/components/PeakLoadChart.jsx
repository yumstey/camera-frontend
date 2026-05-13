import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getLoad } from "../api/analyticsApi";
import { formatDay } from "../helper/formatter/DateFormats.js";
import "../styles/charts.css";
import CalendarPanel from "./CalendarPanel.jsx";
import { Spinner } from "./Spinner";

function StatPill({ label, color }) {
  return (
    <div className="peak-stat">
      <span className="peak-stat__dot" style={{ background: color }} />
      <span className="peak-stat__label">{label}</span>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip" style={{ minWidth: 130 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 12 }}>
        {typeof label === "number" ? `День ${label}` : label}
      </div>
      {payload.map((p) => (
        <div
          key={p.dataKey}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 12,
          }}
        >
          <span style={{ color: p.fill, fontWeight: 600 }}>{p.name}</span>
          <span>{new Intl.NumberFormat().format(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function PeakLoadChart() {
  const [tab, setTab] = useState("week");
  const [data, setData] = useState(null);
  const [loading, setIsLoading] = useState(true);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);

  const handleTabChange = (newTab) => {
    if (isCustomRange) {
      setCalendarKey((k) => k + 1);
      setIsCustomRange(false);
      setFrom(null);
      setTo(null);
    }
    setTab(newTab);
  };

  const handleCalendarChange = ({ startDate, endDate }) => {
    if (startDate && endDate) {
      setIsCustomRange(true);
      setFrom(formatDay(startDate));
      setTo(formatDay(endDate));
    } else {
      setIsCustomRange(false);
      setFrom(null);
      setTo(null);
    }
  };

  useEffect(() => {
    const fetchLoad = async () => {
      try {
        setIsLoading(true);
        const res = await getLoad(tab, from, to);
        setData(res.rows);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };
    fetchLoad();
  }, [tab, from, to]);

  return (
    <div>
      <p className="block-label" style={{ marginTop: 16 }}>
        Пиковая нагрузка
      </p>
      <div className="chart-card">
        <div className="chart-card__header">
          <div>
            <h3 className="chart-card__title">Нагрузка</h3>
            <p className="chart-card__subtitle">
              Количество посетителей — макс / Сред
            </p>
          </div>
          <div className="peak-tabs">
            <CalendarPanel key={calendarKey} onChange={handleCalendarChange} />
            {["week", "month"].map((t) => (
              <button
                key={t}
                className={`tab-btn ${!isCustomRange && tab === t ? "active" : ""}`}
                onClick={() => handleTabChange(t)}
              >
                {t === "week" ? "Неделя" : "Месяц"}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div
            style={{
              minHeight: 220,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Spinner />
          </div>
        ) : (
          <>
            <div className="peak-stats-row">
              <StatPill label="Макс" color="#1a1d23" />
              <StatPill label="Сред" color="#4a90d9" />
            </div>

            <ResponsiveContainer width="100%" height={190}>
              <BarChart
                data={data}
                margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                barGap={1}
                barCategoryGap={tab === "month" ? "20%" : "35%"}
              >
                <CartesianGrid
                  vertical={false}
                  stroke="rgba(60,60,67,0.07)"
                  strokeDasharray="0"
                />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10.5,
                    fill: "#aeaeb2",
                    fontFamily: "var(--font)",
                  }}
                />
                <YAxis
                  dataKey="max"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 10.5,
                    fill: "#aeaeb2",
                    fontFamily: "var(--font)",
                  }}
                  width={38}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: "rgba(0,0,0,0.03)" }}
                />
                <Bar
                  dataKey="max"
                  name="Макс"
                  fill="#1a1d23"
                  radius={[3, 3, 0, 0]}
                  barSize={tab === "month" ? 4 : 10}
                />
                <Bar
                  dataKey="avg"
                  name="Сред"
                  fill="#4a90d9"
                  radius={[3, 3, 0, 0]}
                  barSize={tab === "month" ? 4 : 10}
                />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}
