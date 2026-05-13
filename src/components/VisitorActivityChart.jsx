import { useState, useEffect } from "react";
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
import { normalizeRows } from "../helper/formatter/Normalize.js";
import { getDashboardFilter, getHourlyReport } from "../api/analyticsApi";

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
    <div className="custom-tooltip" style={{ backgroundColor: '#fff', border: '1px solid #ccc', padding: '10px', borderRadius: '4px' }}>
      <p style={{ margin: 0, fontWeight: 'bold' }}>{label}</p>
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

export default function VisitorActivityChart() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState("Сегодня");
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [calendarKey, setCalendarKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      let responseData;

      if (from && to) {
        responseData = await getDashboardFilter("all", from, to);
      } else if (activeTab === "Месяц") {
        responseData = await getDashboardFilter("month");
      } else if (activeTab === "Неделя") {
        responseData = await getDashboardFilter("week");
      } else {
        const today = new Date().toISOString().split("T")[0];
        responseData = await getHourlyReport(today);
      }

      const normalized = normalizeRows(responseData);
      setData(normalized);
    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, from, to]);

  const handleTabChange = (tab) => {
    setIsCustomRange(false);
    setFrom(null);
    setTo(null);
    setActiveTab(tab);
    setCalendarKey((k) => k + 1); 
  };

  const handleCalendarChange = ({ startDate, endDate }) => {
    if (startDate && endDate) {
      setIsCustomRange(true);
      setActiveTab(null);
      setFrom(startDate);
      setTo(endDate);
    } else {
      setIsCustomRange(false);
    }
  };

  return (
    <div className="chart-card">
      <div className="chart-card__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 className="chart-card__title">Активность посетителей</h3>
        </div>

        <div className="tab-section">
          <div className="tab-bar" style={{ display: 'flex', gap: '10px' }}>
            <CalendarPanel
              key={calendarKey}
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

      <div style={{ position: 'relative', width: '100%', height: 220 }}>
        {loading && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 2 }}>Yuklanmoqda...</div>}
        
        <ResponsiveContainer width="100%" height="100%">
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
              dataKey="day"
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
    </div>
  );
}