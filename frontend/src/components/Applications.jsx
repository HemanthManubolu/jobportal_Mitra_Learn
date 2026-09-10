import Navbar from './shared/Navbar';
import AppliedJobTable from './AppliedJobTable';
import useGetAppliedJobs from '@/hooks/useGetAppliedJobs';
export default function Applications() { useGetAppliedJobs(); return <><Navbar /><main className="max-w-5xl mx-auto my-10"><h1 className="font-bold text-2xl mb-5">My applications</h1><AppliedJobTable /></main></>; }
