import { Application } from '../models/application.model.js';
import { Job } from '../models/job.model.js';
import { SavedJob } from '../models/savedJob.model.js';
import { withNormalizedSkills } from '../utils/jobResponse.js';

export const personalDashboard = async (req, res, next) => {
    try {
        await Job.updateMany({ created_by: req.id, status: 'active', deadline: { $lte: new Date() } }, { $set: { status: 'expired' } });
        if (req.user.role === 'candidate') {
            const [totalApplications, pendingApplications, acceptedApplications, rejectedApplications, totalSavedJobs, recentApplications, recentSavedJobs] = await Promise.all([
                Application.countDocuments({ applicant: req.id }), Application.countDocuments({ applicant: req.id, status: 'pending' }),
                Application.countDocuments({ applicant: req.id, status: 'accepted' }), Application.countDocuments({ applicant: req.id, status: 'rejected' }),
                SavedJob.countDocuments({ user: req.id }), Application.find({ applicant: req.id }).sort({ createdAt: -1 }).limit(5).populate({ path: 'job', populate: { path: 'company' } }),
                SavedJob.find({ user: req.id }).sort({ createdAt: -1 }).limit(5).populate({ path: 'job', populate: { path: 'company' } })
            ]);
            return res.json({ success: true, role: 'candidate', statistics: { totalApplications, pendingApplications, acceptedApplications, rejectedApplications, totalSavedJobs }, recentApplications: recentApplications.map((application) => ({ ...application.toObject(), job: withNormalizedSkills(application.job) })), recentSavedJobs: recentSavedJobs.map((saved) => ({ ...saved.toObject(), job: withNormalizedSkills(saved.job) })) });
        }
        const ownerJobs = { created_by: req.id };
        const [totalJobs, activeJobs, closedJobs, jobIds, recentJobs] = await Promise.all([
            Job.countDocuments(ownerJobs), Job.countDocuments({ ...ownerJobs, status: 'active' }), Job.countDocuments({ ...ownerJobs, status: 'closed' }),
            Job.find(ownerJobs).distinct('_id'), Job.find(ownerJobs).sort({ createdAt: -1 }).limit(5).populate('company')
        ]);
        const [totalApplicants, recentApplications] = await Promise.all([
            Application.countDocuments({ job: { $in: jobIds } }), Application.find({ job: { $in: jobIds } }).sort({ createdAt: -1 }).limit(5).populate({ path: 'job', populate: { path: 'company' } }).populate('applicant', 'fullname email')
        ]);
        return res.json({ success: true, role: 'employer', statistics: { totalJobs, activeJobs, closedJobs, totalApplicants }, recentJobs: recentJobs.map(withNormalizedSkills), recentApplications: recentApplications.map((application) => ({ ...application.toObject(), job: withNormalizedSkills(application.job) })) });
    } catch (error) { next(error); }
};
