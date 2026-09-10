import React, { useEffect, useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '../ui/table'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Edit2, Eye, MoreHorizontal } from 'lucide-react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import CompanyAvatar from '../CompanyAvatar'

const AdminJobsTable = () => { 
    const {allAdminJobs, searchJobByText} = useSelector(store=>store.job);

    const [filterJobs, setFilterJobs] = useState(allAdminJobs);
    const navigate = useNavigate();

    const closeJob = async (id) => {
        try { await axios.patch(`${API_END_POINT}/jobs/${id}/close`, {}, { withCredentials: true }); setFilterJobs((jobs) => jobs.map((job) => job._id === id ? { ...job, status: 'closed' } : job)); toast.success('Job closed.'); }
        catch (error) { toast.error(error.response?.data?.message || 'Unable to close job.'); }
    };
    const deleteJob = async (id) => {
        if (!window.confirm('Delete this job permanently?')) return;
        try { await axios.delete(`${API_END_POINT}/jobs/${id}`, { withCredentials: true }); setFilterJobs((jobs) => jobs.filter((job) => job._id !== id)); toast.success('Job deleted.'); }
        catch (error) { toast.error(error.response?.data?.message || 'Unable to delete job.'); }
    };

    useEffect(()=>{ 
        console.log('called');
        const filteredJobs = allAdminJobs.filter((job)=>{
            if(!searchJobByText){
                return true;
            };
            return job?.title?.toLowerCase().includes(searchJobByText.toLowerCase()) || job?.company?.name.toLowerCase().includes(searchJobByText.toLowerCase());

        });
        setFilterJobs(filteredJobs);
    },[allAdminJobs,searchJobByText])
    return (
        <div>
            <Table>
                <TableCaption>A list of your recent  posted jobs</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {
                        filterJobs?.map((job) => (
                            <tr key={job._id}>
                                <TableCell><div className="flex items-center gap-2"><CompanyAvatar job={job} className="h-8 w-8" /><span>{job?.company?.name}</span></div></TableCell>
                                <TableCell>{job?.title}</TableCell>
                                <TableCell className="capitalize">{job?.status || 'active'}</TableCell>
                                <TableCell>{job?.createdAt.split("T")[0]}</TableCell>
                                <TableCell className="text-right cursor-pointer">
                                    <Popover>
                                        <PopoverTrigger><MoreHorizontal /></PopoverTrigger>
                                        <PopoverContent className="w-32">
                                            <div onClick={()=> navigate(`/employer/jobs/${job._id}/edit`)} className='flex items-center gap-2 w-fit cursor-pointer'>
                                                <Edit2 className='w-4' />
                                                <span>Edit</span>
                                            </div>
                                            <div onClick={()=> navigate(`/employer/jobs/${job._id}/applicants`)} className='flex items-center w-fit gap-2 cursor-pointer mt-2'>
                                                <Eye className='w-4'/>
                                                <span>Applicants</span>
                                            </div>
                                            {job.status !== 'closed' && <div onClick={() => closeJob(job._id)} className='mt-2 cursor-pointer text-amber-700'>Close</div>}
                                            <div onClick={() => deleteJob(job._id)} className='mt-2 cursor-pointer text-red-600'>Delete</div>
                                        </PopoverContent>
                                    </Popover>
                                </TableCell>
                            </tr>

                        ))
                    }
                </TableBody>
            </Table>
        </div>
    )
}

export default AdminJobsTable
