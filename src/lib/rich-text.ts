'use client';

const COLOR_STYLE_PROPS = new Set([
  'color',
  'background',
  'background-image',
  'background-clip',
  '-webkit-background-clip',
  '-webkit-text-fill-color',
]);

const ALLOWED_RICH_TEXT_STYLE_PROPS = new Set([
  ...COLOR_STYLE_PROPS,
  'text-decoration',
  'font-weight',
  'font-style',
]);

interface SanitizeStyleOptions {
  stripColorOnly?: boolean;
}

interface SanitizeHtmlOptions {
  singleLine?: boolean;
}

export function sanitizeRichTextStyle(style: string, options: SanitizeStyleOptions = {}): string {
  return style
    .split(';')
    .map(rule => rule.trim())
    .filter(Boolean)
    .map(rule => {
      const separator = rule.indexOf(':');
      if (separator === -1) return null;

      const property = rule.slice(0, separator).trim().toLowerCase();
      const value = rule.slice(separator + 1).trim();
      if (!value) return null;

      if (options.stripColorOnly) {
        return COLOR_STYLE_PROPS.has(property) ? null : `${property}:${value}`;
      }

      return ALLOWED_RICH_TEXT_STYLE_PROPS.has(property) ? `${property}:${value}` : null;
    })
    .filter((rule): rule is string => !!rule)
    .join(';');
}

export function sanitizeRichTextHtml(html = '', options: SanitizeHtmlOptions = {}): string {
  let next = html || '';

  next = next.replace(/\r\n?/g, '\n');
  next = next.replace(/<font\b[^>]*>/gi, '<span>');
  next = next.replace(/<\/font>/gi, '</span>');
  next = next.replace(/&nbsp;/gi, ' ');

  next = next.replace(/\sstyle=(['"])(.*?)\1/gi, (_match, quote: string, styles: string) => {
    const sanitized = sanitizeRichTextStyle(styles);
    return sanitized ? ` style=${quote}${sanitized}${quote}` : '';
  });

  if (options.singleLine) {
    next = next.replace(/<br\s*\/?>/gi, ' ');
    next = next.replace(/<\/?(div|p|h[1-6]|section|article|blockquote|ul|ol|li)[^>]*>/gi, ' ');
    next = next.replace(/\n+/g, ' ');
    next = next.replace(/\s{2,}/g, ' ');
    next = next.trim();
    next = next.replace(/>\s+</g, '><');
  } else {
    next = next.replace(/<br\s*\/?>\s*<\/(div|p|h[1-6]|section|article|blockquote)>/gi, '</$1>');
    next = next.replace(/<\/(div|p|h[1-6]|section|article|blockquote|li)>/gi, '<br>');
    next = next.replace(/<(div|p|h[1-6]|section|article|blockquote|li)[^>]*>/gi, '');
    next = next.replace(/\n/g, '<br>');
    next = next.replace(/(<br\s*\/?>\s*){3,}/gi, '<br><br>');
    next = next.replace(/^(<br\s*\/?>\s*)+/i, '');
    next = next.replace(/(<br\s*\/?>\s*)+$/i, '');
  }

  next = next.replace(/<span>\s*<\/span>/gi, '');

  return next;
}
