import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'
import CompanyAvatar from './CompanyAvatar'
import { companyName, descriptionPreview, normalizeEmploymentType, normalizeWorkMode } from '@/utils/jobPresentation'

const LatestJobCards = ({job}) => {
    const navigate = useNavigate();
    return (
        <div onClick={()=> navigate(`/description/${job._id}`)} className='cursor-pointer rounded-lg border border-gray-200 bg-white p-5 shadow-sm'>
            <div className="flex items-center gap-3">
                <CompanyAvatar job={job} />
                <div><h2 className='font-medium text-lg'>{companyName(job)}</h2><p className='text-sm text-gray-500'>📍 {job?.location || 'Location not specified'}</p></div>
            </div>
            <div>
                <h1 className='font-bold text-lg my-2'>{job?.title}</h1>
                <p className='line-clamp-3 whitespace-pre-line text-sm text-gray-600'>{descriptionPreview(job?.description, 220)}</p>
            </div>
            <div className='flex items-center gap-2 mt-4'>
                <Badge className={'text-blue-700 font-bold'} variant="ghost">{normalizeEmploymentType(job?.employmentType || job?.jobType)}</Badge>
                <Badge className={'text-[#F83002] font-bold'} variant="ghost">{normalizeWorkMode(job?.workMode)}</Badge>
            </div>

        </div>
    )
}

export default LatestJobCards
