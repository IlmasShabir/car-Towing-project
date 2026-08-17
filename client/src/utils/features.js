export const cleanFeature = (value) =>
  String(value)
    .trim()
    .replace(/^"|"$/g, '')
    .replace(/^\[|\]$/g, '')
    .trim();

export const normalizeFeatures = (value) => {
  const arr = Array.isArray(value) ? value : [];
  return arr
    .flatMap((f) => {
      const s = String(f).trim();
      if (s.startsWith('[')) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) return parsed;
        } catch {
          // Fall through
        }
      }
      return s;
    })
    .map(cleanFeature)
    .filter(Boolean);
};