import { Fragment, useState } from 'react';
import axios from 'axios';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { API_END_POINT } from '@/utils/constant';
import CompanyAvatar from '../CompanyAvatar';
import { descriptionPreview, normalizeEmploymentType, normalizeWorkMode } from '@/utils/jobPresentation';

const listText = (value) => Array.isArray(value) ? value.join(', ') : '';
const dateValue = (value) => value ? new Date(value).toISOString().slice(0, 10) : '';
const errorMessage = (error, fallback) => error.response?.data?.message || fallback;

const JobEditor = ({ job, onChange }) => {
    const text = (field, label, type = 'text') => <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">{label}</span><Input type={type} value={job[field] ?? ''} onChange={(event) => onChange(field, event.target.value)} /></label>;
    return <div className="grid gap-3 border-t bg-violet-50 p-4 sm:grid-cols-2">
        {text('title', 'Title')}{text('company', 'Company')}{text('companyLogo', 'Company logo URL')}{text('location', 'Location')}
        <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Work mode</span><select className="h-10 w-full rounded-md border border-input bg-white px-3" value={job.workMode ?? 'Remote'} onChange={(event) => onChange('workMode', event.target.value)}><option>Remote</option><option>Hybrid</option><option>On-site</option></select></label>
        {text('employmentType', 'Employment type')}{text('salary', 'Salary', 'number')}{text('experienceLevel', 'Experience level')}
        <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Skills (comma separated)</span><Input value={listText(job.skills)} onChange={(event) => onChange('skills', event.target.value.split(',').map((value) => value.trim()).filter(Boolean))} /></label>
        <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Benefits (comma separated)</span><Input value={listText(job.benefits)} onChange={(event) => onChange('benefits', event.target.value.split(',').map((value) => value.trim()).filter(Boolean))} /></label>
        <label className="block text-sm"><span className="mb-1 block font-medium text-gray-700">Posted date</span><Input type="date" value={dateValue(job.postedDate)} onChange={(event) => onChange('postedDate', event.target.value || undefined)} /></label>
        <label className="block text-sm sm:col-span-2"><span className="mb-1 block font-medium text-gray-700">Description</span><textarea className="min-h-28 w-full rounded-md border border-input bg-white p-2" value={job.description ?? ''} onChange={(event) => onChange('description', event.target.value)} /></label>
    </div>;
};

export default function ScraperPreview({ onImported }) {
    const [jobs, setJobs] = useState([]);
    const [selected, setSelected] = useState(() => new Set());
    const [editing, setEditing] = useState(null);
    const [fetching, setFetching] = useState(false);
    const [importing, setImporting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [details, setDetails] = useState([]);

    const fetchJobs = async () => {
        setFetching(true); setError(''); setMessage(''); setDetails([]);
        try {
            const response = await axios.get(`${API_END_POINT}/scrape/preview`, { withCredentials: true });
            setJobs(response.data.jobs || []); setSelected(new Set()); setEditing(null);
            setMessage(`${response.data.fetched ?? response.data.jobs?.length ?? 0} jobs fetched. Review and explicitly select the jobs to import.`);
            if (response.data.errors) setDetails(response.data.errorDetails || []);
        } catch (requestError) { setJobs([]); setSelected(new Set()); setError(errorMessage(requestError, 'Unable to fetch Remotive jobs.')); }
        finally { setFetching(false); }
    };

    const toggleSelected = (sourceUrl) => setSelected((current) => {
        const next = new Set(current); if (next.has(sourceUrl)) next.delete(sourceUrl); else next.add(sourceUrl); return next;
    });
    const updateJob = (sourceUrl, field, value) => setJobs((current) => current.map((job) => job.sourceUrl === sourceUrl ? { ...job, [field]: value } : job));
    const selectAll = () => setSelected(new Set(jobs.map((job) => job.sourceUrl)));

    const importSelected = async () => {
        const chosen = jobs.filter((job) => selected.has(job.sourceUrl));
        if (!chosen.length) { setError('Select at least one job before importing.'); return; }
        setImporting(true); setError(''); setMessage(''); setDetails([]);
        try {
            const response = await axios.post(`${API_END_POINT}/scrape/import`, { jobs: chosen }, { withCredentials: true });
            const result = response.data;
            setMessage(`Import complete: ${result.added} added, ${result.duplicates} duplicates, ${result.errors} errors.`);
            setDetails(result.errorDetails || []);
            if (result.added) onImported?.();
        } catch (requestError) {
            const response = requestError.response?.data;
            setError(errorMessage(requestError, 'Unable to import selected jobs.'));
            setDetails(response?.errorDetails || []);
        } finally { setImporting(false); }
    };

    const row = (job, mobile = false) => {
        const editor = <JobEditor job={job} onChange={(field, value) => updateJob(job.sourceUrl, field, value)} />;
        if (mobile) return <article key={job.sourceUrl} className="rounded-lg border bg-white p-4 shadow-sm"><div className="flex gap-3"><input aria-label={`Select ${job.title}`} type="checkbox" checked={selected.has(job.sourceUrl)} onChange={() => toggleSelected(job.sourceUrl)} /><CompanyAvatar job={job} /><div className="min-w-0 flex-1"><h3 className="font-semibold">{job.title}</h3><p className="text-sm text-gray-600">{job.company} · {job.location}</p><p className="mt-1 text-sm text-gray-500">{normalizeEmploymentType(job.employmentType)} · {normalizeWorkMode(job.workMode)} · {job.source}</p><p className="mt-2 line-clamp-3 whitespace-pre-line text-sm text-gray-500">{descriptionPreview(job.description, 180)}</p><p className="mt-1 text-sm text-gray-500">{listText(job.skills) || 'No skills listed'}</p><Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => setEditing(editing === job.sourceUrl ? null : job.sourceUrl)}>{editing === job.sourceUrl ? 'Close edit' : 'Edit'}</Button></div></div>{editing === job.sourceUrl && editor}</article>;
        return <Fragment key={job.sourceUrl}><tr><td className="p-3"><input aria-label={`Select ${job.title}`} type="checkbox" checked={selected.has(job.sourceUrl)} onChange={() => toggleSelected(job.sourceUrl)} /></td><td className="p-3"><CompanyAvatar job={job} className="h-10 w-10" /></td><td className="p-3 font-medium">{job.title}<p className="mt-1 line-clamp-2 max-w-xs whitespace-pre-line text-xs font-normal text-gray-500">{descriptionPreview(job.description, 140)}</p></td><td className="p-3">{job.company}</td><td className="p-3">{job.location}<p className="mt-1 text-xs text-gray-500">{normalizeWorkMode(job.workMode)} · {normalizeEmploymentType(job.employmentType)}</p></td><td className="p-3 text-sm text-gray-600">{listText(job.skills) || '—'}<p className="mt-1 text-xs">{job.source}</p></td><td className="p-3"><Button type="button" variant="outline" size="sm" onClick={() => setEditing(editing === job.sourceUrl ? null : job.sourceUrl)}>{editing === job.sourceUrl ? 'Close' : 'Edit'}</Button></td></tr>{editing === job.sourceUrl && <tr><td colSpan="7" className="p-0">{editor}</td></tr>}</Fragment>;
    };

    return <section className="mt-8 rounded-lg border bg-white p-5 shadow-sm" aria-labelledby="scraper-preview-title">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="scraper-preview-title" className="text-xl font-semibold">Scraper Preview</h2><p className="text-sm text-gray-500">Fetch and edit Remotive jobs before explicitly importing them. Fetching never saves jobs.</p></div><Button type="button" onClick={fetchJobs} disabled={fetching || importing}>{fetching ? 'Fetching jobs…' : 'Fetch Jobs'}</Button></div>
        {message && <p className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800">{message}</p>}{error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {!!details.length && <div className="mt-3 rounded-md bg-amber-50 p-3 text-sm text-amber-800"><p className="font-medium">Job details</p><ul className="mt-1 list-disc pl-5">{details.slice(0, 10).map((item, index) => <li key={`${item.index ?? index}-${item.sourceUrl ?? ''}`}>{item.sourceUrl ? `${item.sourceUrl}: ` : ''}{item.message}</li>)}</ul></div>}
        {jobs.length > 0 && <><div className="mt-5 flex flex-wrap items-center gap-3"><span className="text-sm text-gray-600">{selected.size} of {jobs.length} selected</span><Button type="button" variant="outline" size="sm" onClick={selectAll}>Select All</Button><Button type="button" variant="outline" size="sm" onClick={() => setSelected(new Set())}>Deselect All</Button><Button type="button" onClick={importSelected} disabled={importing || selected.size === 0}>{importing ? 'Importing…' : 'Import Selected Jobs'}</Button></div><div className="mt-4 hidden overflow-x-auto md:block"><table className="w-full min-w-[960px] text-left"><thead className="border-b bg-gray-50 text-sm text-gray-600"><tr><th className="p-3">Select</th><th className="p-3">Logo</th><th className="p-3">Job title / preview</th><th className="p-3">Company</th><th className="p-3">Location / type</th><th className="p-3">Skills / source</th><th className="p-3">Edit</th></tr></thead><tbody>{jobs.map((job) => row(job))}</tbody></table></div><div className="mt-4 grid gap-3 md:hidden">{jobs.map((job) => row(job, true))}</div></>}
        {!fetching && !jobs.length && !error && <p className="mt-5 rounded-md bg-gray-50 p-4 text-sm text-gray-500">No jobs loaded yet. Fetch jobs to create a non-persistent preview.</p>}
    </section>;
}
