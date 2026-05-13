const pad = (n) => String(n).padStart(2, "0");

export const  formatDay = (date)  => {
  const d = new Date(date);

  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}