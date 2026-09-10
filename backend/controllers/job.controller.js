import mongoose from "mongoose";
import { Job } from "../models/job.model.js";
import { Company } from "../models/company.model.js";
import { employmentTypeMatcher, normalizeEmploymentType, normalizeWorkMode, workModeMatcher } from "../utils/jobNormalizers.js";
import { normalizeSkills, skillMatcher } from "../utils/skillNormalizer.js";
import { withNormalizedSkills } from "../utils/jobResponse.js";

const asArray = (value) => Array.isArray(value) ? value : typeof value === 'string' ? value.split(',').map((item) => item.trim()).filter(Boolean) : [];
const validId = (id) => mongoose.Types.ObjectId.isValid(id);
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const validWorkModes = new Set(['Remote', 'Hybrid', 'On-site']);
const validStatuses = new Set(['active', 'closed', 'expired']);
const expirePastDeadlines = () => Job.updateMany({ status: 'active', deadline: { $lte: new Date() } }, { $set: { status: 'expired' } });
const fields = (body) => {
    const employmentType = body.employmentType ?? body.jobType;
    return { title: body.title?.trim(), description: body.description?.trim(), location: body.location?.trim(), salary: body.salary === undefined || body.salary === '' ? undefined : Number(body.salary), experienceLevel: body.experienceLevel ?? body.experience, employmentType: employmentType === undefined ? undefined : normalizeEmploymentType(employmentType), jobType: employmentType === undefined ? undefined : normalizeEmploymentType(employmentType), workMode: body.workMode === undefined ? undefined : normalizeWorkMode(body.workMode), position: body.position === undefined || body.position === '' ? undefined : Number(body.position), requirements: body.requirements === undefined ? undefined : asArray(body.requirements), benefits: body.benefits === undefined ? undefined : asArray(body.benefits), skills: body.skills === undefined ? undefined : normalizeSkills(asArray(body.skills)), deadline: body.deadline || undefined };
};
const defined = (object) => Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined));
const validateValues = (values, { partial = false } = {}) => {
    if (!partial && (!values.title || !values.description || values.salary === undefined || !values.location || !values.employmentType || !values.position)) return 'title, description, salary, location, employmentType and position are required.';
    if (values.salary !== undefined && (!Number.isFinite(values.salary) || values.salary < 0)) return 'Salary must be a non-negative number.';
    if (values.position !== undefined && (!Number.isInteger(values.position) || values.position < 1)) return 'Position must be a whole number of at least 1.';
    if (values.workMode !== undefined && !validWorkModes.has(values.workMode)) return 'Work mode must be Remote, Hybrid, or On-site.';
    if (values.status !== undefined && !validStatuses.has(values.status)) return 'Invalid job status.';
    if (values.deadline && (Number.isNaN(new Date(values.deadline).getTime()) || new Date(values.deadline) <= new Date())) return 'Deadline must be a future date.';
    return null;
};

export const createJob = async (req, res, next) => { try {
    const { companyId } = req.body;
    if (!companyId || !validId(companyId)) return res.status(400).json({ success: false, message: "A valid companyId is required." });
    const company = await Company.findOne({ _id: companyId, userId: req.id });
    if (!company) return res.status(403).json({ success: false, message: "You can only post jobs for your own company." });
    const values = defined(fields(req.body));
    const validation = validateValues(values); if (validation) return res.status(400).json({ success: false, message: validation });
    const job = await Job.create({ ...values, company: company._id, created_by: req.id }); res.status(201).json({ success: true, message: "New job created successfully.", job });
} catch (error) { next(error); } };
export const postJob = createJob;
export const getAllJobs = async (req, res, next) => { try {
    const { search = req.query.keyword || '', location, workMode, employmentType, experienceLevel, skills, status = 'active', minSalary, maxSalary, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    await expirePastDeadlines();
    const pageNumber = Number(page), limitNumber = Number(limit);
    if (!Number.isInteger(pageNumber) || pageNumber < 1 || !Number.isInteger(limitNumber) || limitNumber < 1 || limitNumber > 100) return res.status(400).json({ success: false, message: 'page must be a positive integer and limit must be between 1 and 100.' });
    const normalizedWorkMode = workMode ? normalizeWorkMode(workMode) : '';
    if (workMode && !validWorkModes.has(normalizedWorkMode)) return res.status(400).json({ success: false, message: 'Invalid workMode filter.' });
    if (status !== 'all' && !validStatuses.has(status)) return res.status(400).json({ success: false, message: 'Invalid status filter.' });
    if ((minSalary && (!Number.isFinite(Number(minSalary)) || Number(minSalary) < 0)) || (maxSalary && (!Number.isFinite(Number(maxSalary)) || Number(maxSalary) < 0)) || (minSalary && maxSalary && Number(minSalary) > Number(maxSalary))) return res.status(400).json({ success: false, message: 'Provide a valid salary range.' });
    const query = {};
    if (search) { const safeSearch = escapeRegex(search.slice(0, 100)); query.$or = [{ title: { $regex: safeSearch, $options: 'i' } }, { description: { $regex: safeSearch, $options: 'i' } }, { skills: { $regex: safeSearch, $options: 'i' } }]; }
    if (location) query.location = { $regex: escapeRegex(location.slice(0, 100)), $options: 'i' }; if (normalizedWorkMode) query.workMode = workModeMatcher(normalizedWorkMode);
    if (employmentType) query.$and = [...(query.$and || []), { $or: [{ employmentType: employmentTypeMatcher(employmentType) }, { jobType: employmentTypeMatcher(employmentType) }] }];
    if (experienceLevel) query.experienceLevel = { $regex: escapeRegex(experienceLevel.slice(0, 100)), $options: 'i' }; if (skills) query.skills = { $all: asArray(skills).slice(0, 10).map((skill) => skillMatcher(skill.slice(0, 50))) };
    if (status && status !== 'all') query.status = status; if (minSalary || maxSalary) query.salary = { ...(minSalary ? { $gte: Number(minSalary) } : {}), ...(maxSalary ? { $lte: Number(maxSalary) } : {}) };
    const safePage = pageNumber, safeLimit = limitNumber;
    const sort = ['createdAt', 'salary', 'deadline', 'title'].includes(sortBy) ? { [sortBy]: sortOrder === 'asc' ? 1 : -1 } : { createdAt: -1 };
    const [jobs, total] = await Promise.all([Job.find(query).populate('company').sort(sort).skip((safePage - 1) * safeLimit).limit(safeLimit), Job.countDocuments(query)]);
    res.json({ success: true, jobs: jobs.map(withNormalizedSkills), pagination: { page: safePage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) } });
} catch (error) { next(error); } };
export const getJobById = async (req, res, next) => { try { if (!validId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid job id." }); await expirePastDeadlines(); const job = await Job.findById(req.params.id).populate('company'); if (!job) return res.status(404).json({ success: false, message: "Job not found." }); const safeJob = withNormalizedSkills(job); delete safeJob.applications; delete safeJob.created_by; res.json({ success: true, job: safeJob }); } catch (error) { next(error); } };
const owned = (id, user) => validId(id) ? Job.findOne({ _id: id, created_by: user }) : null;
export const updateJob = async (req, res, next) => { try { const job = await owned(req.params.id, req.id); if (!job) return res.status(404).json({ success: false, message: "Job not found or not owned by you." }); if (req.body.companyId && String(job.company) !== req.body.companyId) return res.status(400).json({ success: false, message: "A job cannot be moved to another company." }); const values = defined(fields(req.body)); const validation = validateValues(values, { partial: true }); if (validation) return res.status(400).json({ success: false, message: validation }); Object.assign(job, values); await job.save(); res.json({ success: true, message: "Job updated successfully.", job }); } catch (error) { next(error); } };
export const deleteJob = async (req, res, next) => { try { const job = await owned(req.params.id, req.id); if (!job) return res.status(404).json({ success: false, message: "Job not found or not owned by you." }); const { Application } = await import('../models/application.model.js'); const { SavedJob } = await import('../models/savedJob.model.js'); await Promise.all([Application.deleteMany({ job: job._id }), SavedJob.deleteMany({ job: job._id })]); await job.deleteOne(); res.json({ success: true, message: "Job deleted successfully." }); } catch (error) { next(error); } };
export const closeJob = async (req, res, next) => { try { const job = await owned(req.params.id, req.id); if (!job) return res.status(404).json({ success: false, message: "Job not found or not owned by you." }); job.status = 'closed'; await job.save(); res.json({ success: true, message: "Job closed successfully.", job }); } catch (error) { next(error); } };
export const getEmployerJobs = async (req, res, next) => { try { await expirePastDeadlines(); const jobs = await Job.find({ created_by: req.id }).populate('company').sort({ createdAt: -1 }); res.json({ success: true, jobs: jobs.map(withNormalizedSkills) }); } catch (error) { next(error); } };
export const getAdminJobs = getEmployerJobs;
