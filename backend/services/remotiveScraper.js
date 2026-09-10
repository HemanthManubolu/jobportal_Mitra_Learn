import { Company } from "../models/company.model.js";
import { Job } from "../models/job.model.js";
import { normalizeEmploymentType, normalizeWorkMode } from "../utils/jobNormalizers.js";
import { normalizeSkills } from "../utils/skillNormalizer.js";
import { cleanJobDescription, extractSkills } from "../utils/scraperContent.js";
import { jobicySource } from "./sources/jobicySource.js";

// Backwards-compatible export used by existing callers and tests.
export const cleanRemotiveDescription = cleanJobDescription;
const validWorkModes = new Set(['Remote', 'Hybrid', 'On-site']);

// Remotive exposes this public job feed. Do not scrape sites that prohibit automation.
// This shared reader only contacts Remotive. It never reads or writes local collections.
export const fetchRemotiveJobs = async () => {
    const response = await fetch('https://remotive.com/api/remote-jobs', { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Remotive returned ${response.status}`);
    const payload = await response.json();
    if (!payload || !Array.isArray(payload.jobs)) throw new Error('Remotive response did not contain a jobs array');
    const paginationMetadata = Object.keys(payload).filter((key) => /page|next|cursor/i.test(key));
    // Source diagnostics only: no job descriptions, user data, or other sensitive
    // payload fields are logged. This makes a changing source-side result visible.
    console.info('Remotive jobs received:', payload.jobs.length);
    console.info('Remotive response summary:', {
        reportedJobCount: payload['job-count'],
        reportedTotalJobCount: payload['total-job-count'],
        paginationMetadata,
        firstTitles: payload.jobs.slice(0, 5).map((job) => job.title)
    });
    // Remotive documents `limit` as an optional cap whose default is all results;
    // the public response has no pagination metadata. Return every source record.
    return payload.jobs;
};

// `company` stays a name here; persistence resolves it to a Company id.
export const normalizeRemotiveJob = (item) => {
    if (!item?.url || !item?.title) return null;
    const description = cleanJobDescription(item.description);
    const postedDate = item.publication_date && !Number.isNaN(new Date(item.publication_date).getTime()) ? new Date(item.publication_date).toISOString() : undefined;
    return {
        title: item.title, company: (item.company_name || 'Unknown company').trim(), companyLogo: item.company_logo_url || undefined,
        description: description || item.title, requirements: [], benefits: [], salary: 0, experienceLevel: 'Not specified',
        location: item.candidate_required_location || 'Remote', workMode: normalizeWorkMode('remote'), employmentType: normalizeEmploymentType(item.job_type || 'Full-time'),
        jobType: normalizeEmploymentType(item.job_type || 'Full-time'), skills: extractSkills(`${item.title} ${description}`), position: 1,
        source: 'remotive', sourceUrl: item.url, postedDate, isAggregated: true, status: 'active'
    };
};

const remotiveSource = {
    name: 'remotive', fetchJobs: fetchRemotiveJobs, normalizeJob: normalizeRemotiveJob,
    acceptsUrl: (url) => url.hostname === 'remotive.com' || url.hostname.endsWith('.remotive.com')
};
// Each adapter returns raw jobs and one normalized job shape. Adding another
// permitted public source does not require changes to duplicate/import logic.
const configuredSources = [remotiveSource, jobicySource];
const sourceAdapterFor = (source) => configuredSources.find((adapter) => adapter.name === source);

export const previewRemotiveJobs = async () => {
    const result = { jobs: [], errors: 0, errorDetails: [] };
    const responses = await Promise.allSettled(configuredSources.map((adapter) => adapter.fetchJobs()));
    let availableSources = 0;
    responses.forEach((response, sourceIndex) => {
        const adapter = configuredSources[sourceIndex];
        if (response.status === 'rejected') {
            result.errors += 1;
            result.errorDetails.push({ source: adapter.name, message: response.reason?.message || `Unable to fetch ${adapter.name} jobs.` });
            return;
        }
        availableSources += 1;
        response.value.forEach((item, index) => {
            try {
                const job = adapter.normalizeJob(item);
                if (!job) throw new Error('Missing job title or source URL.');
                result.jobs.push(job);
            } catch (error) {
                result.errors += 1;
                result.errorDetails.push({ source: adapter.name, index, message: error.message || `Unable to normalize this ${adapter.name} job.` });
            }
        });
    });
    if (!availableSources) throw new Error(result.errorDetails.map((detail) => `${detail.source}: ${detail.message}`).join('; ') || 'No configured job source was available.');
    return result;
};

const trimString = (value) => typeof value === 'string' ? value.trim() : '';
const stringArray = (value, field) => {
    if (value === undefined || value === null || value === '') return { value: [] };
    const input = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : null;
    if (!input || input.some((item) => typeof item !== 'string')) return { error: `${field} must be an array of strings or comma-separated text.` };
    return { value: [...new Set(input.map((item) => item.trim()).filter(Boolean))] };
};

const validateImportedRemotiveJob = (raw) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { error: 'Job must be an object.' };
    const title = trimString(raw.title), company = trimString(raw.company), description = trimString(raw.description), location = trimString(raw.location), employmentType = trimString(raw.employmentType), sourceUrl = trimString(raw.sourceUrl);
    const experienceLevel = trimString(raw.experienceLevel) || 'Not specified';
    const salary = raw.salary === '' || raw.salary === undefined || raw.salary === null ? NaN : Number(raw.salary);
    if (!title || !company || !description || !location || !employmentType) return { error: 'title, company, description, location, and employmentType are required.' };
    if (!Number.isFinite(salary) || salary < 0) return { error: 'salary must be a non-negative number.' };
    const workMode = normalizeWorkMode(raw.workMode);
    const normalizedEmploymentType = normalizeEmploymentType(raw.employmentType);
    if (!validWorkModes.has(workMode)) return { error: 'workMode must be Remote, Hybrid, or On-site.' };
    const skills = stringArray(raw.skills, 'skills'); if (skills.error) return skills;
    const benefits = stringArray(raw.benefits, 'benefits'); if (benefits.error) return benefits;
    const companyLogo = trimString(raw.companyLogo);
    if (companyLogo) {
        try { const url = new URL(companyLogo); if (!['http:', 'https:'].includes(url.protocol)) throw new Error(); }
        catch { return { error: 'companyLogo must be a valid http(s) URL.' }; }
    }
    let postedDate;
    if (raw.postedDate) { postedDate = new Date(raw.postedDate); if (Number.isNaN(postedDate.getTime())) return { error: 'postedDate must be a valid date.' }; }
    const source = trimString(raw.source).toLowerCase();
    const adapter = sourceAdapterFor(source);
    if (!adapter) return { error: 'Only configured public-source preview jobs can be imported.' };
    try {
        const url = new URL(sourceUrl);
        if (!['http:', 'https:'].includes(url.protocol) || !adapter.acceptsUrl(url)) throw new Error();
    } catch { return { error: `sourceUrl must be an original ${source} http(s) URL.` }; }
    return { value: { title, company, companyLogo: companyLogo || undefined, description, requirements: [], benefits: benefits.value, salary, experienceLevel, location, workMode, employmentType: normalizedEmploymentType, jobType: normalizedEmploymentType, skills: normalizeSkills(skills.value), position: 1, source, sourceUrl, postedDate, isAggregated: true, status: 'active' } };
};

const findOrCreateCompany = async ({ company: name, companyLogo, ownerId }) => {
    let company = await Company.findOne({ name });
    // Public-source logo fields are image URLs, never company website URLs.
    if (!company) company = await Company.create({ name, logo: companyLogo, userId: ownerId });
    return company;
};

const importNormalizedJob = async (job, ownerId) => {
    if (await Job.exists({ source: job.source, sourceUrl: job.sourceUrl })) return 'duplicate';
    const company = await findOrCreateCompany({ ...job, ownerId });
    await Job.create({ ...job, company: company._id, created_by: ownerId });
    return 'added';
};

// Existing POST /scrape/jobs contract is retained; it now imports every configured
// permitted public source through the same normalized duplicate-safe flow.
export const importRemotiveJobs = async (ownerId) => {
    const result = { added: 0, duplicates: 0, errors: 0 };
    let preview;
    try { preview = await previewRemotiveJobs(); }
    catch (error) { return { ...result, errors: 1, detail: error.message }; }
    result.errors += preview.errors;
    for (const job of preview.jobs) {
        try {
            const outcome = await importNormalizedJob(job, ownerId);
            result[outcome === 'added' ? 'added' : 'duplicates'] += 1;
        } catch (error) { if (error?.code === 11000) result.duplicates += 1; else result.errors += 1; }
    }
    return result;
};

export const importSelectedRemotiveJobs = async (ownerId, jobs) => {
    const result = { added: 0, duplicates: 0, errors: 0, errorDetails: [] };
    for (let index = 0; index < jobs.length; index += 1) {
        const validation = validateImportedRemotiveJob(jobs[index]);
        if (validation.error) { result.errors += 1; result.errorDetails.push({ index, sourceUrl: jobs[index]?.sourceUrl, message: validation.error }); continue; }
        try {
            const outcome = await importNormalizedJob(validation.value, ownerId);
            result[outcome === 'added' ? 'added' : 'duplicates'] += 1;
        } catch (error) {
            if (error?.code === 11000) result.duplicates += 1;
            else { result.errors += 1; result.errorDetails.push({ index, sourceUrl: validation.value.sourceUrl, message: error.message || 'Unable to import this job.' }); }
        }
    }
    return result;
};
