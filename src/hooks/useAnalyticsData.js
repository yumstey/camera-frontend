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
    stats: null,
    visitorActivity: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      const dateString = selectedDate
        ? selectedDate.toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);

      const currentDate = selectedDate || new Date();
      const monthString = String(currentDate.getMonth() + 1).padStart(2, "0");
      const yearString = currentDate.getFullYear();
      const monthParam = `${yearString}-${monthString}`;

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
        dailyReport,
        avgWeek,
        avgMonth,
        visitorActivity,
        peakWeek,
        peakMonth,
        monthlyOverview,
      ] = await Promise.all([
        getDailyReport(dateString),
        getAverageReport("week"),
        getAverageReport("month"),
        visitorActivityPromise,
        getPeakLoad("week"),
        getPeakLoad("month"),
      ]);

      const checkin = dailyReport?.report?.checkin ?? 0;
      const checkout = dailyReport?.report?.checkout ?? 0;

      const weeklyAvg = avgWeek?.rows?.[0]?.average?.total_visitors ?? 0;
      const monthlyAvg = avgMonth?.rows?.[0]?.average?.total_visitors ?? 0;

      const stats = {
        nowInPark: { value: checkin, change: 0 },
        loginsToday: { value: checkin, change: 0 },
        outputsToday: { value: monthlyAvg, change: 0 },
        avgPerWeek: { value: weeklyAvg, change: 0 },
      };

      const peakLoad = {
        weekly: normalizeRows(peakWeek),
        monthly: normalizeRows(peakMonth),
      };

      setData({
        stats,
        visitorActivity: visitorActivity ?? [],
        peakLoad,
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
