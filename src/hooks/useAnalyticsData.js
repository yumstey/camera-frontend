import { useCallback, useEffect, useState } from "react";
import { getDashboardFilter, getHourlyReport } from "../api/analyticsApi";

const REFRESH_INTERVAL = 30000;
const DEFAULT_TAB = "Сегодня";

function normalizeRows(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.rows)) return response.rows;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.hours)) return response.hours;
  return [];
}

async function fetchVisitorActivity(activeTab, from, to) {
  if (from && to) {
    const data = await getDashboardFilter("all", from, to);
    return normalizeRows(data);
  }

  if (activeTab === "Месяц") {
    const data = await getDashboardFilter("month");
    return normalizeRows(data);
  }

  if (activeTab === "Неделя") {
    const data = await getDashboardFilter("week");
    return normalizeRows(data);
  }

  const today = new Date().toISOString().split("T")[0];
  const data = await getHourlyReport(today);
  return normalizeRows(data);
}

export function useAnalyticsData(
  activeTab = DEFAULT_TAB,
  from = null,
  to = null,
) {
  const [data, setData] = useState({ visitorActivity: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const visitorActivity = await fetchVisitorActivity(activeTab, from, to);

      setData({ visitorActivity });
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Ошибка загрузки данных",
      );
    } finally {
      setLoading(false);
    }
  }, [activeTab, from, to]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    const id = setInterval(fetchAll, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchAll]);

  return { data, loading, error, refetch: fetchAll, lastUpdated };
}

export function useTabData(activeTab, from, to) {
  const { data, loading, error, refetch, lastUpdated } = useAnalyticsData(
    activeTab,
    from,
    to,
  );

  return { data, loading, error, refetch, lastUpdated };
}
