export const formatParams = (params: Record<string, any>): string => {
  if (!params || Object.keys(params).length === 0) return "";
  const queryString = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");
  return `?${queryString}`;
};
