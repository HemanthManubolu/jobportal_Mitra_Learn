const cleanToken = (value) => String(value || '').trim().toLowerCase().replace(/[\s_-]+/g, '-').replace(/^-|-$/g, '');
const readable = (value) => String(value || '').trim().split(/[\s_-]+/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');

const employmentTypes = {
    'full-time': 'Full-time', 'fulltime': 'Full-time',
    'part-time': 'Part-time', 'parttime': 'Part-time',
    contract: 'Contract', temporary: 'Temporary', internship: 'Internship'
};
const workModes = { remote: 'Remote', hybrid: 'Hybrid', 'on-site': 'On-site', onsite: 'On-site' };

export const normalizeEmploymentType = (value) => employmentTypes[cleanToken(value)] || readable(value);
export const normalizeWorkMode = (value) => workModes[cleanToken(value)] || readable(value);

const escaped = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const matchers = {
    'Full-time': 'full[\\s_-]*time', 'Part-time': 'part[\\s_-]*time', Contract: 'contract', Temporary: 'temporary', Internship: 'internship',
    Remote: 'remote', Hybrid: 'hybrid', 'On-site': 'on[\\s_-]*site'
};
const matcher = (value) => new RegExp(`^\\s*(?:${matchers[value] || escaped(value).replace(/[\\s_-]+/g, '[\\s_-]*')})\\s*$`, 'i');

// Anchored MongoDB regexes keep old underscore/hyphen/space variants filterable
// without loading the complete collection into application memory.
export const employmentTypeMatcher = (value) => matcher(normalizeEmploymentType(value));
export const workModeMatcher = (value) => matcher(normalizeWorkMode(value));
