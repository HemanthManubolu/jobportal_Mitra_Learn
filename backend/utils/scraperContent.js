import { extractSkills } from './skillNormalizer.js';

const decodeHtml = (text) => text.replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code) => {
    const value = code.toLowerCase().startsWith('x') ? parseInt(code.slice(1), 16) : parseInt(code, 10);
    try { return String.fromCodePoint(value); } catch { return _; }
}).replace(/&(nbsp|amp|quot|apos|lt|gt|ndash|mdash|hellip|rsquo|lsquo|rdquo|ldquo);/gi, (_, entity) => ({ nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' }[entity.toLowerCase()]));

// Preserve complete, readable job text while removing inactive HTML/unsafe markup.
export const cleanJobDescription = (html = '') => decodeHtml(String(html)
    .replace(/\r\n?/g, '\n').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<\s*br\s*\/?\s*>/gi, '\n').replace(/<\s*\/\s*(p|div|section|article|h[1-6])\s*>/gi, '\n\n')
    .replace(/<\s*li\b[^>]*>/gi, '\n• ').replace(/<[^>]*>/g, ''))
    .replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').replace(/[ \t]{2,}/g, ' ').replace(/\n{3,}/g, '\n\n').trim();

export { extractSkills };
