import http from "./http";

export async function getDailyReport(day) {
  const { data } = await http.get("/dashboard/daily", { params: { day } });
  return data;
}

export async function getAverageReport(period) {
  const { data } = await http.get("/dashboard/avg", { params: { period } });
  return data;
}

export async function getHourlyReport(day) {
  const { data } = await http.get(`/dashboard/hourly?day=${day}`);
  return data;
}

export async function getPeakLoad(period) {
  const { data } = await http.get("/dashboard/max", { params: { period } });
  return data;
}

export async function getMonthlyOverview(month) {
  const { data } = await http.get("/dashboard/month/all", {
    params: { month },
  });
  return data;
}

export async function getDashboardFilter(params, from, to) {
  let url = `/dashboard/filter?filter=${params}`;
  if (from) {
    url += `&from=${from}`;
  }
  if (to) {
    url += `&to=${to}`;
  }
  const { data } = await http.get(url);
  return data;
}

export async function getTrafficByGender() {
  // Mock data
  return [
    { name: "Male", value: 65, color: "#3b82f6" },
    { name: "Female", value: 35, color: "#ec4899" },
  ];
}

export async function getTrafficByAgeGroups() {
  // Mock data
  return [
    { name: "0-18", value: 15, color: "#6366f1" },
    { name: "18-35", value: 35, color: "#3b82f6" },
    { name: "35-65", value: 35, color: "#8b5cf6" },
    { name: "65+", value: 15, color: "#ec4899" },
  ];
}
