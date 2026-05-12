import { useState } from "react";
import "./styles/global.css";

import AuthPage, { deleteAccount, loadAccount } from "./components/AuthPage";
import CamerasPage from "./components/CamerasPage";
import PeakLoadChart from "./components/PeakLoadChart";
import SecondCalendarPanel from "./components/SecondCalendarPanel.jsx";
import Sidebar from "./components/Sidebar";
import StatCard from "./components/StatCard";
import TrafficGenderChart from "./components/TrafficGenderChart";
import TrafficGroupChart from "./components/TrafficGroup.jsx";
import VisitorActivityChart from "./components/VisitorActivityChart";
import { useTabData } from "./hooks/useAnalyticsData";

function Spinner() {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      Загрузка...
    </div>
  );
}

export default function App() {
  const [account, setAccount] = useState(() => loadAccount());
  const [activeNav, setActiveNav] = useState("dashboard");
  const [visitorTab, setVisitorTab] = useState("Сегодня");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [from, setFrom] = useState();
  const [to, setTo] = useState();

  const { data, loading, error, refetch } = useTabData(
    visitorTab,
    selectedDate,
    from,
    to,
  );

  const handleTabChange = (tab) => {
    setVisitorTab(tab);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  if (!account) {
    return <AuthPage onLogin={(acc) => setAccount(acc)} />;
  }

  return (
    <div className="app-layout">
      <Sidebar
        activeNav={activeNav}
        onNavChange={setActiveNav}
        account={account}
        onLogout={() => {
          deleteAccount();
          setAccount(null);
        }}
      />

      <main className="main-content">
        {activeNav === "dashboard" && (
          <>
            <div
              className="dashboard-header"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <div>
                <h1>Аналитика парка</h1>
                <p>Обзор активности посетителей в реальном времени</p>
              </div>
            </div>
            <div className="tab-section">
              <SecondCalendarPanel
                value={selectedDate}
                onChange={handleDateChange}
              />
            </div>
            {selectedDate && (
              <div className="dashboard-subtitle" style={{ marginBottom: 12 }}>
                Выбранная дата:{" "}
                {selectedDate.toLocaleDateString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            )}
            {error && <div className="error-msg">⚠ {error}</div>}
            <p className="block-label">Обзор</p>
            {loading || !data.stats ? (
              <div className="stat-cards-grid">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="stat-card" style={{ minHeight: 90 }}>
                    <Spinner />
                  </div>
                ))}
              </div>
            ) : (
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
            )}
            <p className="block-label" style={{ marginTop: 16 }}>
              Активность посетителей
            </p>
            {loading || !data.visitorActivity ? (
              <div className="card">
                <Spinner />
              </div>
            ) : (
              <VisitorActivityChart
                data={data.visitorActivity}
                activeTab={visitorTab}
                onTabChange={handleTabChange}
                setFrom={setFrom}
                setTo={setTo}
              />
            )}
            <div className="bottom-grid">
              <div>
                <p className="block-label" style={{ marginTop: 16 }}>
                  Пиковая нагрузка
                </p>

                {loading || !data.peakLoad ? (
                  <div className="card" style={{ minHeight: 260 }}>
                    <Spinner />
                  </div>
                ) : (
                  <PeakLoadChart data={data.peakLoad} />
                )}
              </div>
              <div>
                <p className="block-label" style={{ marginTop: 16 }}>
                  Трафик по категориям
                </p>
                {loading || !data.genderActivity ? (
                  <div className="card" style={{ minHeight: 260 }}>
                    <Spinner />
                  </div>
                ) : (
                  <TrafficGenderChart title="Трафик по категориям" />
                )}
              </div>
              <div>
                <p className="block-label" style={{ marginTop: 16 }}>
                  Трафик по возрастным группам
                </p>
                {loading || !data.ageActivity ? (
                  <div className="card" style={{ minHeight: 260 }}>
                    <Spinner />
                  </div>
                ) : (
                  <TrafficGroupChart title="Трафик по возрастным группам" />
                )}
              </div>
            </div>
          </>
        )}
        {activeNav === "cameras" && (
          <>
            <div className="dashboard-header">
              <h1>Камеры</h1>
              <p>Мониторинг камер в реальном времени</p>
            </div>
            <CamerasPage />
          </>
        )}
        {activeNav === "settings" && (
          <div className="dashboard-header">
            <h1>Настройки</h1>
            <p>Скоро будет доступно</p>
          </div>
        )}
      </main>
    </div>
  );
}
