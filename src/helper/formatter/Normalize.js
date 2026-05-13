export function normalizeRows(response) {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.rows)) return response.rows;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.hours)) return response.hours;
  return [];
}