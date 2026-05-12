export const formatDay = (day) => {
  if (!day) return new Date().toISOString().slice(0, 10);
  return new Date(day).toISOString().slice(0, 10);
};