import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Bookmark } from 'lucide-react'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import CompanyAvatar from './CompanyAvatar'
import { companyName, descriptionPreview, normalizeEmploymentType, normalizeWorkMode } from '@/utils/jobPresentation'

const Job = ({job, saved = false}) => {
    const navigate = useNavigate();
    const {user} = useSelector(store => store.auth);
    const [isSaved, setIsSaved] = useState(saved);
    // const jobId = "lsekdhjgdsnfvsdkjf";

    const daysAgoFunction = (mongodbTime) => {
        const createdAt = new Date(mongodbTime);
        const currentTime = new Date();
        const timeDifference = currentTime - createdAt;
        return Math.floor(timeDifference/(1000*24*60*60));
    }
    
    const toggleSave = async () => {
        if (user?.role !== 'candidate') return toast.error('Sign in as a candidate to save jobs.');
        try { await axios({ method: isSaved ? 'delete' : 'post', url: `${API_END_POINT}/jobs/${job._id}/save`, withCredentials: true }); setIsSaved(!isSaved); toast.success(isSaved ? 'Removed from saved jobs.' : 'Job saved.'); } catch (error) { toast.error(error.response?.data?.message || 'Unable to update saved jobs.'); }
    };
    useEffect(() => {
        if (saved || user?.role !== 'candidate') return;
        axios.get(`${API_END_POINT}/jobs/saved`, { withCredentials: true })
            .then((res) => setIsSaved((res.data.jobs || []).some((item) => item?._id === job?._id)))
            .catch(() => {});
    }, [job?._id, saved, user?.role]);
    return (
        <article className='flex h-full flex-col rounded-lg border border-gray-200 bg-white p-5 shadow-sm'>
            <div className='flex items-center justify-between'>
                <p className='text-sm text-gray-500'>{daysAgoFunction(job?.createdAt) === 0 ? "Today" : `${daysAgoFunction(job?.createdAt)} days ago`}</p>
                <Button onClick={toggleSave} variant="outline" className="rounded-full" size="icon"><Bookmark fill={isSaved ? 'currentColor' : 'none'} /></Button>
            </div>

            <div className='flex items-center gap-3 my-3'>
                <CompanyAvatar job={job} />
                <div>
                    <h2 className='font-medium text-lg'>{companyName(job)}</h2>
                    <p className='text-sm text-gray-500'>📍 {job?.location || 'Location not specified'}</p>
                </div>
            </div>

            <div>
                <h1 className='font-bold text-lg my-2'>{job?.title}</h1>
                <p className='line-clamp-4 whitespace-pre-line text-sm text-gray-600'>{descriptionPreview(job?.description)}</p>
            </div>
            <div className='flex items-center gap-2 mt-4'>
                <Badge className={'text-blue-700 font-bold'} variant="ghost">{normalizeEmploymentType(job?.employmentType || job?.jobType) || 'Not specified'}</Badge>
                <Badge className={'text-[#F83002] font-bold'} variant="ghost">{normalizeWorkMode(job?.workMode) || 'On-site'}</Badge>
                <Badge className={'text-[#7209b7] font-bold'} variant="ghost">{job?.salary ?? 0} LPA</Badge>
            </div>
            {!!job?.skills?.length && <p className="mt-3 line-clamp-1 text-sm text-gray-500">{job.skills.join(' • ')}</p>}
            <div className='mt-auto flex items-center gap-4 pt-4'>
                <Button onClick={()=> navigate(`/jobs/${job?._id}`)} variant="outline">View Details</Button>
                <Button onClick={toggleSave} className="bg-[#7209b7]">{isSaved ? 'Saved' : 'Save For Later'}</Button>
            </div>
        </article>
    )
}

export default Job
