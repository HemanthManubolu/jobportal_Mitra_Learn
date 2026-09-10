import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Navbar from '../shared/Navbar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { API_END_POINT } from '@/utils/constant';
import { toast } from 'sonner';

export default function EditJob() {
  const { id } = useParams(); const navigate = useNavigate();
  const [form, setForm] = useState(null); const [saving, setSaving] = useState(false);
  useEffect(() => { axios.get(`${API_END_POINT}/jobs/${id}`, { withCredentials: true }).then(({ data }) => { const job = data.job; setForm({ title: job.title || '', description: job.description || '', requirements: (job.requirements || []).join(', '), salary: job.salary ?? '', location: job.location || '', jobType: job.jobType || job.employmentType || '', experience: job.experienceLevel || '', position: job.position || '', workMode: job.workMode || 'On-site', skills: (job.skills || []).join(', '), benefits: (job.benefits || []).join(', '), deadline: job.deadline?.slice(0, 10) || '' }); }).catch((error) => toast.error(error.response?.data?.message || 'Unable to load job.')); }, [id]);
  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => { event.preventDefault(); setSaving(true); try { await axios.put(`${API_END_POINT}/jobs/${id}`, form, { withCredentials: true }); toast.success('Job updated successfully.'); navigate('/employer/jobs'); } catch (error) { toast.error(error.response?.data?.message || 'Unable to update job.'); } finally { setSaving(false); } };
  if (!form) return <><Navbar /><p className="max-w-4xl mx-auto my-10">Loading job…</p></>;
  return <><Navbar /><main className="max-w-3xl mx-auto my-10"><h1 className="font-bold text-2xl mb-5">Edit job</h1><form onSubmit={submit} className="grid grid-cols-2 gap-4 border rounded-lg p-6 bg-white">{[['title', 'Title'], ['description', 'Description'], ['requirements', 'Requirements (comma separated)'], ['salary', 'Salary'], ['location', 'Location'], ['jobType', 'Employment type'], ['experience', 'Experience level'], ['position', 'Positions'], ['workMode', 'Work mode'], ['skills', 'Skills (comma separated)'], ['benefits', 'Benefits (comma separated)'], ['deadline', 'Deadline']].map(([name, label]) => <label key={name} className={name === 'description' ? 'col-span-2' : ''}><Label>{label}</Label><Input type={name === 'deadline' ? 'date' : name === 'salary' || name === 'position' ? 'number' : 'text'} name={name} value={form[name]} onChange={change} className="mt-1" /></label>)}<div className="col-span-2 flex gap-3"><Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button><Button type="button" variant="outline" onClick={() => navigate('/employer/jobs')}>Cancel</Button></div></form></main></>;
}
