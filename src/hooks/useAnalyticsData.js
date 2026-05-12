import { useCallback, useEffect, useState } from "react";
import {
  getAverageReport,
  getDailyReport,
  getDashboardFilter,
  getHourlyReport,
  getPeakLoad,
} from "../api/analyticsApi";

const REFRESH_INTERVAL = 30_000;
const DEFAULT_TAB = "Сегодня";

function normalizeRows(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.rows)) return response.rows;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.hours)) return response.hours;
  return [];
}



export function useAnalyticsData(
  selectedDate,
  activeTab = DEFAULT_TAB,
  from,
  to,
) {
  const [data, setData] = useState({
    visitorActivity: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      const visitorActivityPromise = (async () => {
        if ((from, to)) {
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
        if (activeTab === "Сегодня") {
          const today = new Date().toISOString().split("T")[0];
          const data = await getHourlyReport(today);
          return normalizeRows(data);
        }
      })();
      const [
        visitorActivity,
      ] = await Promise.all([
        visitorActivityPromise,
      ]);
      setData({
        visitorActivity: visitorActivity ?? [],
      });
      setLastUpdated(new Date());
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to load data",
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate, activeTab, from, to]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll, from, to]);

  useEffect(() => {
    const id = setInterval(fetchAll, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchAll]);

  return { data, loading, error, refetch: fetchAll, lastUpdated };
}

export function useTabData(activeTab, selectedDate, from, to) {
  const [tabLoading, setTabLoading] = useState(false);
  const { data, loading, error, refetch, lastUpdated } = useAnalyticsData(
    selectedDate,
    activeTab,
    from,
    to,
  );

  const handleTabChange = useCallback(async () => {
    setTabLoading(true);
    await refetch();
    setTabLoading(false);
  }, [refetch]);
  return {
    data,
    loading: loading || tabLoading,
    error,
    refetch: handleTabChange,
    lastUpdated,
  };
}
