import { normalizeEmploymentType, normalizeWorkMode } from '../../utils/jobNormalizers.js';
import { cleanJobDescription, extractSkills } from '../../utils/scraperContent.js';

const API_URL = 'https://jobicy.com/api/v2/remote-jobs?count=200';

export const fetchJobicyJobs = async () => {
    const response = await fetch(API_URL, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Jobicy returned ${response.status}`);
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.jobs)) throw new Error('Jobicy response did not contain a jobs array');
    console.info('Jobicy jobs received:', payload.jobs.length);
    console.info('Jobicy response summary:', { reportedJobCount: payload.jobCount, firstTitles: payload.jobs.slice(0, 5).map((job) => job.jobTitle) });
    return payload.jobs;
};

export const normalizeJobicyJob = (item) => {
    if (!item?.url || !item?.jobTitle) return null;
    const description = cleanJobDescription(item.jobDescription || item.jobExcerpt);
    const jobType = Array.isArray(item.jobType) ? item.jobType[0] : item.jobType;
    const postedDate = item.pubDate && !Number.isNaN(new Date(item.pubDate).getTime()) ? new Date(item.pubDate).toISOString() : undefined;
    const salary = Number(item.salaryMax || item.salaryMin || 0);
    return {
        title: item.jobTitle.trim(), company: (item.companyName || 'Unknown company').trim(), companyLogo: item.companyLogo || undefined,
        description: description || item.jobTitle, requirements: [], benefits: [], salary: Number.isFinite(salary) && salary >= 0 ? salary : 0,
        experienceLevel: item.jobLevel || 'Not specified', location: item.jobGeo || 'Remote', workMode: normalizeWorkMode('remote'),
        employmentType: normalizeEmploymentType(jobType || 'Full-time'), jobType: normalizeEmploymentType(jobType || 'Full-time'),
        skills: extractSkills(`${item.jobTitle} ${description}`), position: 1, source: 'jobicy', sourceUrl: item.url,
        postedDate, isAggregated: true, status: 'active'
    };
};

export const jobicySource = { name: 'jobicy', fetchJobs: fetchJobicyJobs, normalizeJob: normalizeJobicyJob, acceptsUrl: (url) => url.hostname === 'jobicy.com' || url.hostname.endsWith('.jobicy.com') };
