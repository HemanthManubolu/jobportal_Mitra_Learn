import { useEffect, useState } from 'react'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { API_END_POINT, JOB_API_END_POINT } from '@/utils/constant';
import { setSingleJob } from '@/redux/jobSlice';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import Navbar from './shared/Navbar';
import CompanyAvatar from './CompanyAvatar';
import { companyName, descriptionText, normalizeEmploymentType, normalizeWorkMode } from '@/utils/jobPresentation';

const JobDescription = () => {
    const {singleJob} = useSelector(store => store.job);
    const {user} = useSelector(store=>store.auth);
    const isIntiallyApplied = false;
    const [isApplied, setIsApplied] = useState(isIntiallyApplied);

    const params = useParams();
    const jobId = params.id;
    const dispatch = useDispatch();

    const applyJobHandler = async () => {
        try {
            const res = await axios.post(`${API_END_POINT}/jobs/${jobId}/apply`, {}, {withCredentials:true});
            
            if(res.data.success){
                setIsApplied(true); // Update the local state
                toast.success(res.data.message);

            }
        } catch (error) {
            console.log(error);
            toast.error(error.response.data.message);
        }
    }

    useEffect(()=>{
        const fetchSingleJob = async () => {
            try {
                const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`,{withCredentials:true});
                if(res.data.success){
                    dispatch(setSingleJob(res.data.job));
                    if (user?.role === 'candidate') axios.get(`${API_END_POINT}/applications`, { withCredentials: true }).then(({ data }) => setIsApplied((data.applications || []).some((application) => String(application.job?._id || application.job) === String(jobId)))).catch(() => {});
                }
            } catch (error) {
                console.log(error);
            }
        }
        fetchSingleJob(); 
    },[jobId,dispatch, user?._id]);

    return (
        <><Navbar /><main className='max-w-5xl mx-auto my-10 px-4 sm:px-6'>
            <div className='flex flex-col justify-between gap-5 sm:flex-row sm:items-start'>
                <div className="flex items-start gap-4"><CompanyAvatar job={singleJob} className="h-16 w-16" /><div>
                    <h1 className='font-bold text-2xl'>{singleJob?.title}</h1>
                    <p className="mt-1 text-gray-600">{companyName(singleJob)} · 📍 {singleJob?.location || 'Location not specified'}</p>
                    <div className='flex items-center gap-2 mt-4'>
                        <Badge className={'text-blue-700 font-bold'} variant="ghost">{normalizeEmploymentType(singleJob?.employmentType || singleJob?.jobType) || 'Not specified'}</Badge>
                        <Badge className={'text-[#F83002] font-bold'} variant="ghost">{normalizeWorkMode(singleJob?.workMode) || 'On-site'}</Badge>
                        <Badge className={'text-[#7209b7] font-bold'} variant="ghost">{singleJob?.salary ?? 0} LPA</Badge>
                    </div>
                </div></div>
                {user?.role === 'candidate' && <Button
                onClick={isApplied ? null : applyJobHandler}
                    disabled={isApplied}
                    className={`rounded-lg ${isApplied ? 'bg-gray-600 cursor-not-allowed' : 'bg-[#7209b7] hover:bg-[#5f32ad]'}`}>
                    {isApplied ? 'Already Applied' : 'Apply Now'}
                </Button>}
            </div>
            <section className='mt-8 border-t border-gray-300 pt-5'><h2 className='font-semibold text-lg'>Job Description</h2><p className='mt-3 whitespace-pre-line break-words leading-7 text-gray-800'>{descriptionText(singleJob?.description)}</p></section>
            <section className='mt-6 grid gap-3 rounded-lg border bg-white p-5 text-sm sm:grid-cols-2'><p><span className='font-semibold'>Experience:</span> {singleJob?.experienceLevel || 'Not specified'}</p><p><span className='font-semibold'>Positions:</span> {singleJob?.position ?? 1}</p><p><span className='font-semibold'>Skills:</span> {singleJob?.skills?.join(' • ') || 'Not specified'}</p><p><span className='font-semibold'>Posted:</span> {(singleJob?.postedDate || singleJob?.createdAt)?.slice?.(0, 10) || 'Not specified'}</p>{singleJob?.sourceUrl && <p className="sm:col-span-2"><a className="text-[#6A38C2] underline" href={singleJob.sourceUrl} target="_blank" rel="noreferrer">View original posting</a></p>}</section>
        </main></>
    )
}

export default JobDescription
