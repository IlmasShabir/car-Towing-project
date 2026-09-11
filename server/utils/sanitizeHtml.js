const sanitizeHtmlLib = require('sanitize-html');

// Whitelist for the blog rich-text editor output. Covers headings, paragraphs,
// emphasis, lists, links, images, blockquotes and tables. Everything else
// (script, style, event handlers, etc.) is stripped on save.
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'a', 'img',
  'blockquote',
  'table', 'thead', 'tbody', 'tfoot', 'caption', 'tr', 'th', 'td',
  'span', 'div',
];

const ALLOWED_ATTRS = {
  a: ['href', 'title', 'target', 'rel'],
  img: ['src', 'alt', 'title', 'loading', 'width', 'height'],
  th: ['colspan', 'rowspan', 'scope'],
  td: ['colspan', 'rowspan'],
  div: ['style', 'align'],
  p: ['style', 'align'],
  span: ['style'],
  ol: ['start'],
  table: ['summary'],
  caption: ['align'],
};

const ALLOWED_SCHEMES = ['http', 'https', 'mailto', 'tel', 'data'];
const ALLOWED_STYLE_PROPS = ['text-align'];

const parseStyle = (style = '') => {
  const parts = (style || '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  return parts
    .map((part) => {
      const idx = part.indexOf(':');
      if (idx === -1) return null;
      const prop = part.slice(0, idx).trim().toLowerCase();
      const value = part.slice(idx + 1).trim().toLowerCase();
      if (!ALLOWED_STYLE_PROPS.includes(prop)) return null;
      if (value !== 'left' && value !== 'center' && value !== 'right' && value !== 'justify') return null;
      return `${prop}: ${value}`;
    })
    .filter(Boolean)
    .join('; ');
};

const sanitizeHtml = (html) => {
  if (typeof html !== 'string' || !html.trim()) return '';

  // Soft cap on article size to keep the database and requests reasonable.
  if (html.length > 500000) return '';

  const output = sanitizeHtmlLib(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRS,
    allowedSchemes: ALLOWED_SCHEMES,
    allowedSchemesByTag: {
      a: ['http', 'https', 'mailto', 'tel'],
      img: ['http', 'https', 'data'],
    },
    allowProtocolRelative: false,
    transformTags: {
      img: sanitizeHtmlLib.simpleTransform('img', {
        loading: 'lazy',
        decoding: 'async',
      }, { merge: true }),
      table: (tagName, attribs) => ({
        tagName: 'table',
        attribs,
        text: '',
      }),
    },
    exclusiveFilter: (frame) => frame.tag === 'img' && (!frame.attribs.src || frame.attribs.src.trim() === ''),
    textFilter: (text) => text,
  });

  // The editor can generate a table but listing one with no heading still
  // renders fine, so tables are wrapped in a scroll container for small
  // screens and images forced to lazy-load.
  let cleaned = output;

  cleaned = cleaned.replace(/<table(\s[^>]*)?>/gi, '<div class="blog-table-wrap"><table$1>');
  cleaned = cleaned.replace(/<\/table>/gi, '</table></div>');

  // Normalise text-align styles created by the browser + execCommand so they
  // only ever contain safe values.
  cleaned = cleaned.replace(/\sstyle="([^"]*)"/gi, (match, styleValue) => {
    const sanitized = parseStyle(decodeHtmlEntities(styleValue));
    return sanitized ? ` style="${sanitized}"` : '';
  });

  return cleaned;
};

// decode &quot; &apos; &lt; &gt; &amp; inside attribute captures
const decodeHtmlEntities = (str) =>
  str
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

module.exports = { sanitizeHtml };