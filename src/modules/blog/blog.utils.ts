import sanitizeHtml from 'sanitize-html';

export const sanitizeBlogHtml = (dirtyHtml: string): string => {
  return sanitizeHtml(dirtyHtml, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'strong', 'b', 'em', 'i', 'u', 's',
      'ul', 'ol', 'li', 'blockquote',
      'a', 'img', 'br', 'hr',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height'],
      th: ['colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
      table: ['summary', 'width']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data']
    },
    allowProtocolRelative: false,
    enforceHtmlBoundary: true,
  });
};
