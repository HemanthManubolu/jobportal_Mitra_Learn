import mongoose from "mongoose";
import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";
const validId = (id) => mongoose.Types.ObjectId.isValid(id);
export const applyJob = async (req, res, next) => { try {
    const { id: jobId } = req.params; if (!validId(jobId)) return res.status(400).json({ success: false, message: "Invalid job id." });
    const job = await Job.findById(jobId); if (!job) return res.status(404).json({ success: false, message: "Job not found." });
    if (job.status === 'active' && job.deadline && job.deadline <= new Date()) { job.status = 'expired'; await job.save(); }
    if (job.status !== 'active') return res.status(400).json({ success: false, message: "This job is not accepting applications." });
    if (await Application.exists({ job: jobId, applicant: req.id })) return res.status(409).json({ success: false, message: "You have already applied for this job." });
    const application = await Application.create({ job: jobId, applicant: req.id }); job.applications.push(application._id); await job.save(); res.status(201).json({ success: true, message: "Job applied successfully.", application });
} catch (error) { next(error); } };
export const getAppliedJobs = async (req, res, next) => { try { const application = await Application.find({ applicant: req.id }).sort({ createdAt: -1 }).populate({ path: 'job', populate: { path: 'company' } }); res.json({ application, applications: application, success: true }); } catch (error) { next(error); } };
export const getApplicants = async (req, res, next) => { try {
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid job id." });
    const ownership = req.user.role === 'admin' ? { _id: req.params.id } : { _id: req.params.id, created_by: req.id };
    const job = await Job.findOne(ownership).populate({ path: 'applications', options: { sort: { createdAt: -1 } }, populate: { path: 'applicant', select: 'fullname email phoneNumber profile createdAt' } });
    if (!job) return res.status(404).json({ success: false, message: "Job not found or not owned by you." }); res.json({ job, success: true });
} catch (error) { next(error); } };
export const updateStatus = async (req, res, next) => { try {
    const { status } = req.body; if (!['pending', 'accepted', 'rejected'].includes(String(status).toLowerCase())) return res.status(400).json({ success: false, message: "Status must be pending, accepted, or rejected." });
    if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid application id." });
    const application = await Application.findById(req.params.id).populate('job'); if (!application) return res.status(404).json({ success: false, message: "Application not found." });
    if (req.user.role !== 'admin' && String(application.job.created_by) !== String(req.id)) return res.status(403).json({ success: false, message: "You can only update applications for your own jobs." });
    application.status = status.toLowerCase(); await application.save(); res.json({ success: true, message: "Status updated successfully.", application });
} catch (error) { next(error); } };
export const getAllApplications = async (req, res, next) => { try { const page = Number(req.query.page || 1), limit = Number(req.query.limit || 20); if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) return res.status(400).json({ success: false, message: 'page must be positive and limit must be between 1 and 100.' }); const [applications, total] = await Promise.all([Application.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('job').populate('applicant', 'fullname email role'), Application.countDocuments()]); res.json({ success: true, applications, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }); } catch (error) { next(error); } };
