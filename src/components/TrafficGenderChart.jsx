import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { getTrafficGender } from "../api/analyticsApi";
import { formatDay } from "../helper/formatter/DateFormats.js";
import "../styles/charts.css";
import CalendarPanel from "./CalendarPanel.jsx";
import { Spinner } from "./Spinner";

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="custom-tooltip">
      {d.name}: {d.value}%
    </div>
  );
}

export default function TrafficGenderChart({ title = "Трафик по полу" }) {
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
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await getTrafficGender(tab, from, to);
        setData(res);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [tab, from, to]);

  const tabData = data?.genders
    ? [
        {
          name: "Мужчины",
          value: Math.round((data.genders.male / data.genders.total) * 100),
          raw: data.genders.male,
          color: "#1a1d23",
        },
        {
          name: "Женщины",
          value: Math.round((data.genders.female / data.genders.total) * 100),
          raw: data.genders.female,
          color: "#4a90d9",
        },
      ]
    : [];

  const largest = tabData.length
    ? tabData.reduce((a, b) => (a.value > b.value ? a : b))
    : { name: "", value: 0 };

  return (
    <div className="chart-card">
      <div className="chart-card__header">
        <h3 className="chart-card__title">{title}</h3>
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
            minHeight: 180,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spinner />
        </div>
      ) : (
        <div className="gender-layout">
          {/* Donut chart */}
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

            {/* Центр donut */}
            <div className="gender-donut-center">
              <span className="gender-donut-pct">{largest.value}%</span>
              <span className="gender-donut-lbl">{largest.name}</span>
            </div>
          </div>

          {/* Легенда */}
          <div className="gender-legend">
            {tabData.map((item) => (
              <div key={item.name} className="gender-legend__item">
                <div className="gender-legend__left">
                  <span
                    className="gender-legend__dot"
                    style={{ background: item.color }}
                  />
                  <span className="gender-legend__name">{item.name}</span>
                </div>
                <div className="gender-legend__right">
                  <span className="gender-legend__raw">
                    {new Intl.NumberFormat("ru-RU").format(item.raw)} чел. {}
                  </span>
                  <span className="gender-legend__pct">{item.value}%</span>
                </div>
              </div>
            ))}

            <div className="gender-total">
              Всего:{" "}
              <strong>
                {new Intl.NumberFormat("ru-RU").format(
                  data?.genders?.total ?? 0,
                )}
              </strong>{" "}
              чел.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
