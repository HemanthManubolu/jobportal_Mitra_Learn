import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './shared/Navbar';
import FilterCard from './FilterCard';
import Job from './Job';
import { API_END_POINT } from '@/utils/constant';

export default function Jobs() {
  const [filters, setFilters] = useState({ search: '', location: '', workMode: '', employmentType: '', experienceLevel: '', skills: '', sortBy: 'createdAt', sortOrder: 'desc' });
  const [jobs, setJobs] = useState([]); const [page, setPage] = useState(1); const [pagination, setPagination] = useState(null); const [error, setError] = useState('');
  useEffect(() => { const query = new URLSearchParams({ page: String(page), limit: '12', status: 'active' }); Object.entries(filters).forEach(([key, value]) => value && query.set(key, value)); axios.get(`${API_END_POINT}/jobs?${query}`, { withCredentials: true }).then(({ data }) => { setJobs(data.jobs); setPagination(data.pagination); setError(''); }).catch((err) => setError(err.response?.data?.message || 'Unable to load jobs.')); }, [filters, page]);
  const changeFilters = (next) => { setFilters(next); setPage(1); };
  return <><Navbar /><main className="mx-auto mt-5 max-w-7xl px-4 sm:px-6"><div className="flex flex-col gap-5 lg:flex-row"><aside className="w-full lg:w-64"><FilterCard filters={filters} onChange={changeFilters} /></aside><section className="min-w-0 flex-1 pb-8">{error && <p className="mb-4 text-red-600">{error}</p>}{jobs.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{jobs.map((job) => <Job key={job._id} job={job} />)}</div> : <p>Job not found.</p>}{pagination?.pages > 1 && <div className="mt-6 flex items-center justify-center gap-3"><button className="rounded border px-3 py-1 disabled:opacity-50" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span className="text-sm">Page {pagination.page} of {pagination.pages}</span><button className="rounded border px-3 py-1 disabled:opacity-50" disabled={page === pagination.pages} onClick={() => setPage(page + 1)}>Next</button></div>}</section></div></main></>;
}
