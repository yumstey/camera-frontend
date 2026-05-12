import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "../styles/charts.css";
import CalendarPanel from "./CalendarPanel.jsx";

function formatY(val) {
  if (val >= 1_000_000) return `${val / 1_000_000}M`;
  if (val >= 1_000) return `${val / 1_000}K`;
  return val;
}

function formatTooltip(val) {
  return new Intl.NumberFormat("ru-RU").format(val);
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const labels = {
    checkin: "Вход",
    checkout: "Выход",
  };

  return (
    <div className="custom-tooltip">
      <p>{label}</p>
      {payload.map((item) => (
        <div key={item.dataKey}>
          <span>{labels[item.dataKey] || item.dataKey}: </span>
          <strong>{formatTooltip(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}

const TABS = ["Сегодня", "Неделя", "Месяц"];

export default function VisitorActivityChart({
  data = [],
  activeTab,
  onTabChange,
  setFrom,
  setTo,
}) {
  const [calendarKey, setCalendarKey] = useState(0);
  const [isCustomRange, setIsCustomRange] = useState(false);

  const handleTabChange = (tab) => {
    if (isCustomRange) {
      setCalendarKey((k) => k + 1);
      setIsCustomRange(false);
      setFrom && setFrom(null);
      setTo && setTo(null);
    }
    if (onTabChange) onTabChange(tab);
  };

  const formatDate = (date) => {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handleCalendarChange = ({ startDate, endDate }) => {
    if (startDate && endDate) {
      setIsCustomRange(true);
      onTabChange && onTabChange(null);
    } else {
      setIsCustomRange(false);
    }
    setFrom && setFrom(formatDate(startDate));
    setTo && setTo(formatDate(endDate));
  };

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <div>
          <h3 className="chart-card__title">Активность посетителей</h3>
        </div>

        <div className="tab-section">
          <div className="tab-bar">
            <CalendarPanel
              key={calendarKey}
              setFrom={setFrom}
              setTo={setTo}
              onChange={handleCalendarChange}
            />

            {TABS.map((t) => (
              <button
                key={t}
                className={`tab-btn ${!isCustomRange && activeTab === t ? "active" : ""}`}
                onClick={() => handleTabChange(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            strokeDasharray="0"
            stroke="#e8eaf0"
          />

          <XAxis
            dataKey={"day"}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
          />

          <YAxis
            tickFormatter={formatY}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#e8eaf0", strokeWidth: 1 }}
          />

          <Line
            type="monotone"
            dataKey="checkin"
            stroke="#1a1d23"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: "#1a1d23", strokeWidth: 0 }}
          />

          <Line
            type="monotone"
            dataKey="checkout"
            stroke="#a8c8ee"
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            activeDot={{ r: 5, fill: "#4a90d9", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
