import { useEffect, useState } from "react";
import "../styles/global.css";

export const DashboardStates = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    console.log('data')
  }, []);
  return (
    <div className="stat-cards-grid">
      <StatCard
        label="Сейчас в парке"
        value={data.stats.nowInPark.value}
        change={data.stats.nowInPark.change}
      />
      <StatCard
        label="Пришло сегодня"
        value={data.stats.loginsToday.value}
        change={data.stats.loginsToday.change}
      />
      <StatCard
        label="Среднее / месяц"
        value={data.stats.outputsToday.value}
        change={data.stats.outputsToday.change}
      />
      <StatCard
        label="Среднее / неделя"
        value={data.stats.avgPerWeek.value}
        change={data.stats.avgPerWeek.change}
      />
    </div>
  );
};
