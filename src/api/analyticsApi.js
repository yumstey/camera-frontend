import http from "./http";

export async function getDailyReport(day) {
  const { data } = await http.get(`/dashboard/daily?day=${day}`);
  return data;
}
export async function getHourlyReport(day) {
  const { data } = await http.get(`/dashboard/hourly?day=${day}`);
  return data;
}
export async function getDashboardFilter(params, from, to) {
  console.log("A__________" , from , to)
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
export async function getLoad(params, from, to) {
  let url = `/dashboard/load?period=${params}`;
  if (from) {
    url += `&from=${from}`;
  }
  if (to) {
    url += `&to=${to}`;
  }
  const { data } = await http.get(url);
  return data;
}
export async function getTrafficGender(period, from, to) {
  let url = `/dashboard/counts/genders?period=${period}`;
  if (from) {
    url += `&from=${from}`;
  }
  if (to) {
    url += `&to=${to}`;
  }
  const { data } = await http.get(url);
  return data;
}
export async function getTrafficCategory(period, from, to) {
  let url = `/dashboard/counts/age-groups?period=${period}`;
  if (from) {
    url += `&from=${from}`;
  }
  if (to) {
    url += `&to=${to}`;
  }
  const { data } = await http.get(url);
  return data;
}