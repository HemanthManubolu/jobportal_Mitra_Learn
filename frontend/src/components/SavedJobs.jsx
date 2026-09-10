import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './shared/Navbar'; import Job from './Job'; import { API_END_POINT } from '@/utils/constant';
export default function SavedJobs() { const [jobs, setJobs] = useState([]); useEffect(() => { axios.get(`${API_END_POINT}/jobs/saved`, { withCredentials: true }).then((res) => setJobs(res.data.jobs || [])).catch(() => setJobs([])); }, []); return <><Navbar /><main className="max-w-7xl mx-auto my-10 px-4 sm:px-6"><h1 className="font-bold text-2xl mb-6">Saved jobs</h1>{jobs.length ? <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{jobs.map((job) => <Job key={job._id} job={job} saved />)}</div> : <p>No saved jobs yet.</p>}</main></>; }
