export const formatBlogDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Builds a plain-text excerpt fallback from article HTML if an explicit
// excerpt was not provided.
export const stripHtml = (html) => {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
};