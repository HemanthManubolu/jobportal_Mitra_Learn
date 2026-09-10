import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Avatar, AvatarImage } from '../ui/avatar'
import { Bookmark, LogOut, User2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { clearAuth } from '@/redux/authSlice'
import { persistor } from '@/redux/store'
import { toast } from 'sonner'

const Navbar = () => {
    const { user, initialized } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const logoutHandler = async () => {
        try {
            const res = await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not confirm server logout. Local session was cleared.');
        } finally {
            dispatch(clearAuth());
            try {
                await persistor.purge();
            } finally {
                navigate("/login", { replace: true });
            }
        }
    }
    const authenticatedUser = initialized ? user : null;
    const dashboardPath = authenticatedUser?.role === 'admin' ? '/admin/dashboard' : authenticatedUser?.role === 'employer' ? '/employer/dashboard' : '/candidate/dashboard';
    return (
        <div className='bg-white'>
            <div className='flex items-center justify-between mx-auto max-w-7xl h-16 px-4'>
                <div>
                    <h1 className='text-2xl font-bold'>Job<span className='text-[#F83002]'>Portal</span></h1>
                </div>
                <div className='flex items-center gap-3 md:gap-12'>
                    <ul className='hidden md:flex font-medium items-center gap-5'>
                        {
                            authenticatedUser?.role === 'employer' ? (
                                <>
                                    <li><Link to="/employer/dashboard">Dashboard</Link></li>
                                    <li><Link to="/employer/companies">Companies</Link></li>
                                    <li><Link to="/employer/jobs">Jobs</Link></li>
                                </>
                            ) : authenticatedUser?.role === 'admin' ? (
                                <><li><Link to="/admin/dashboard">Dashboard</Link></li></>
                            ) : authenticatedUser?.role === 'candidate' ? (
                                <>
                                    <li><Link to="/candidate/dashboard">Dashboard</Link></li>
                                    <li><Link to="/jobs">Jobs</Link></li>
                                    <li><Link to="/saved-jobs">Saved Jobs</Link></li>
                                </>
                            ) : (
                                <>
                                    <li><Link to="/">Home</Link></li>
                                    <li><Link to="/jobs">Jobs</Link></li>
                                    <li><Link to="/browse">Browse</Link></li>
                                </>
                            )
                        }


                    </ul>
                    {authenticatedUser && <Link to={dashboardPath} className="md:hidden text-sm font-medium text-[#6A38C2]">Dashboard</Link>}
                    {
                        !authenticatedUser ? (
                            <div className='flex items-center gap-2'>
                                <Link to="/login"><Button variant="outline">Login</Button></Link>
                                <Link to="/signup"><Button className="bg-[#6A38C2] hover:bg-[#5b30a6]">Signup</Button></Link>
                            </div>
                        ) : (<>
                            <Button onClick={logoutHandler} variant="outline" className="inline-flex items-center gap-2 whitespace-nowrap">
                                <LogOut className="h-4 w-4" /> Logout
                            </Button>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Avatar className="cursor-pointer">
                                        <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                                    </Avatar>
                                </PopoverTrigger>
                                <PopoverContent className="w-80">
                                    <div className=''>
                                        <div className='flex gap-2 space-y-2'>
                                            <Avatar className="cursor-pointer">
                                                <AvatarImage src={user?.profile?.profilePhoto} alt="@shadcn" />
                                            </Avatar>
                                            <div>
                                                <h4 className='font-medium'>{user?.fullname}</h4>
                                                <p className='text-sm text-muted-foreground'>{user?.profile?.bio}</p>
                                            </div>
                                        </div>
                                        <div className='flex flex-col my-2 text-gray-600'>
                                            {
                                                authenticatedUser?.role === 'candidate' && (
                                                    <><div className='flex w-fit items-center gap-2 cursor-pointer'><User2 /><Button variant="link"> <Link to="/candidate/dashboard">Dashboard</Link></Button></div><div className='flex w-fit items-center gap-2 cursor-pointer'><User2 /><Button variant="link"> <Link to="/profile">View Profile</Link></Button></div><div className='flex w-fit items-center gap-2 cursor-pointer'><Bookmark /><Button variant="link"><Link to="/saved-jobs">Saved Jobs</Link></Button></div></>
                                                )
                                            }

                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </>)
                    }

                </div>
            </div>

        </div>
    )
}

export default Navbar
