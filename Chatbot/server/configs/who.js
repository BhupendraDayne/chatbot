import axios from "axios";

const WHO_API_BASE = "https://ghoapi.azureedge.net/api";
const WHO_INDICATOR_ENDPOINT = "Indicator";

const escapeODataString = (value) => {
  return value.replace(/'/g, "''").toLowerCase();
};

export const searchWHOData = async (query, limit = 4) => {
  try {
    const sanitized = escapeODataString(query);
    const filter = `contains(tolower(IndicatorName),'${sanitized}')`;
    const url = `${WHO_API_BASE}/${WHO_INDICATOR_ENDPOINT}?$top=${limit}&$filter=${encodeURIComponent(filter)}`;

    const { data } = await axios.get(url, {
      headers: { Accept: "application/json" },
      timeout: 10000,
    });

    return Array.isArray(data.value)
      ? data.value.map((item) => ({
          code: item.IndicatorCode,
          title: item.IndicatorName,
          description: item.IndicatorName,
          source: item.GHO,
          year: item.Year,
        }))
      : [];
  } catch (error) {
    console.error("WHO API fetch failed:", error.message || error);
    return [];
  }
};
