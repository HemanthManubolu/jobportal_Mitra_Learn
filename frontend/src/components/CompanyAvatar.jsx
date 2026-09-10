import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { companyLogo, companyName, initials } from '@/utils/jobPresentation';

export default function CompanyAvatar({ job, className = 'h-12 w-12' }) {
    const name = companyName(job);
    return <Avatar className={`${className} rounded-lg border border-gray-200 bg-white`}><AvatarImage src={companyLogo(job) || undefined} alt={`${name} logo`} className="object-contain p-1" /><AvatarFallback className="rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">{initials(name)}</AvatarFallback></Avatar>;
}
