import { normalizeSkills } from './skillNormalizer.js';

// Normalize legacy records at response time as well as on new writes. This keeps
// existing MongoDB documents backward-compatible without a risky bulk migration.
export const withNormalizedSkills = (job) => {
    if (!job) return job;
    const value = typeof job.toObject === 'function' ? job.toObject() : job;
    return { ...value, skills: normalizeSkills(value.skills) };
};
