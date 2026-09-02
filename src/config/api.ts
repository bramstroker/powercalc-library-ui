const configuredApiUrl =
  (typeof process !== "undefined" ? process.env.VITE_API_BASE_URL : undefined) ??
  import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = (configuredApiUrl || "https://api.powercalc.nl").replace(/\/+$/, "");

export const API_ENDPOINTS = {
  LIBRARY: `${API_BASE_URL}/library/full`,
  LIBRARY_CHANGES: `${API_BASE_URL}/library/changes`,
  PROFILE: `${API_BASE_URL}/profile`,
  MANUFACTURER: `${API_BASE_URL}/manufacturer`,
  DOWNLOAD: `${API_BASE_URL}/download`,
  ANALYTICS_SENSORS: `${API_BASE_URL}/analytics/sensors`,
  ANALYTICS_SUMMARY: `${API_BASE_URL}/analytics/summary`,
  ANALYTICS_PROFILES: `${API_BASE_URL}/analytics/profiles`,
  ANALYTICS_VERSIONS: `${API_BASE_URL}/analytics/versions`,
  ANALYTICS_COUNTRIES: `${API_BASE_URL}/analytics/countries`,
  ANALYTICS_TIMESERIES: `${API_BASE_URL}/analytics/timeseries`,
};
