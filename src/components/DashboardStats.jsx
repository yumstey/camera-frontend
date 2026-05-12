import { useEffect, useState } from "react";
import { getDailyReport } from "../api/analyticsApi";
import { formatDay } from "../helper/formatter/DateFormats";
import "../styles/global.css";
import { Spinner } from "./Spinner";
import StatCard from "./StatCard";

export const DashboardStats = ({ day }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getDailyReport(formatDay(day));
        setStats(res.report);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    fetch();
  }, [day]);

  return (
    <div className="stat-cards-grid">
      {loading ? (
        [...Array(4)].map((_, i) => (
          <div key={i} className="stat-card" style={{ minHeight: 90 }}>
            <Spinner />
          </div>
        ))
      ) : (
        <>
          <StatCard label="Сейчас в парке" value={stats?.checkin} />
          <StatCard label="Пришло сегодня" value={stats?.total_visitors} />
          <StatCard label="Среднее / месяц" value={stats?.avg_month} />
          <StatCard label="Среднее / неделя" value={stats?.avg_week} />
        </>
      )}
    </div>
  );
};
