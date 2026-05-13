import { useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import AuthPage, { deleteAccount, loadAccount } from "./components/AuthPage";
import CamerasPage from "./components/CamerasPage";
import { DashboardStats } from "./components/DashboardStats.jsx";
import PeakLoadChart from "./components/PeakLoadChart";
import SecondCalendarPanel from "./components/SecondCalendarPanel.jsx";
import Sidebar from "./components/Sidebar";
import { Spinner } from "./components/Spinner.jsx";
import TrafficGenderChart from "./components/TrafficGenderChart";
import TrafficGroupChart from "./components/TrafficGroup.jsx";
import VisitorActivityChart from "./components/VisitorActivityChart";
import { useTabData } from "./hooks/useAnalyticsData";
import "./styles/global.css";

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

  return (
    <Router>
      {!account ? (
        <Routes>
          <Route
            path="/login"
            element={<AuthPage mode="login" onLogin={setAccount} />}
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      ) : (
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
                  <div
                    className="dashboard-subtitle"
                    style={{ marginBottom: 12 }}
                  >
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
                <DashboardStats day={selectedDate} />
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
                 <PeakLoadChart />
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
      )}
    </Router>
  );
}
