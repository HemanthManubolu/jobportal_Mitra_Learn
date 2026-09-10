const token = (value) => String(value || '').trim().toLowerCase().replace(/[\s_-]+/g, '-').replace(/^-|-$/g, '');
const readable = (value) => String(value || '').trim().split(/[\s_-]+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');

const employment = { 'full-time': 'Full-time', fulltime: 'Full-time', 'part-time': 'Part-time', parttime: 'Part-time', contract: 'Contract', temporary: 'Temporary', internship: 'Internship' };
const workMode = { remote: 'Remote', hybrid: 'Hybrid', 'on-site': 'On-site', onsite: 'On-site' };

export const normalizeEmploymentType = (value) => employment[token(value)] || readable(value);
export const normalizeWorkMode = (value) => workMode[token(value)] || readable(value);
export const companyName = (job) => typeof job?.company === 'string' ? job.company : job?.company?.name || 'Company';
export const companyLogo = (job) => job?.companyLogo || job?.company?.logo || '';
export const initials = (name) => String(name || 'Company').split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase() || 'CO';

const decode = (value) => value.replace(/&(nbsp|amp|quot|apos|lt|gt|ndash|mdash|hellip|rsquo|lsquo|rdquo|ldquo);/gi, (_, entity) => ({ nbsp: ' ', amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' }[entity.toLowerCase()]));
// React renders this as text, never as HTML. This is only a graceful formatter for
// legacy records that may still contain Remotive markup.
export const descriptionText = (value) => decode(String(value || '')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<\s*br\s*\/?\s*>/gi, '\n')
    .replace(/<\s*\/\s*(p|div|section|article|h[1-6])\s*>/gi, '\n\n')
    .replace(/<\s*li\b[^>]*>/gi, '\n• ')
    .replace(/<[^>]*>/g, ''))
    .replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
export const descriptionPreview = (value, limit = 280) => {
    const text = descriptionText(value);
    return text.length > limit ? `${text.slice(0, limit).trimEnd()}…` : text;
};
