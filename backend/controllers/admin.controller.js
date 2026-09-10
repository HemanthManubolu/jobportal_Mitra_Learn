import { User } from '../models/user.model.js';
import { Job } from '../models/job.model.js';
import { Company } from '../models/company.model.js';
import { Application } from '../models/application.model.js';
import { normalizeSkill } from '../utils/skillNormalizer.js';
import { withNormalizedSkills } from '../utils/jobResponse.js';

const count = (model, query = {}) => model.countDocuments(query);
const pageOptions = (req, res) => {
    const page = Number(req.query.page || 1), limit = Number(req.query.limit || 20);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
        res.status(400).json({ success: false, message: 'page must be positive and limit must be between 1 and 100.' });
        return null;
    }
    return { page, limit };
};
const list = async (model, options, populate, hidePassword = false) => {
    const query = model.find().sort({ createdAt: -1 }).skip((options.page - 1) * options.limit).limit(options.limit);
    if (hidePassword) query.select('-password');
    if (populate) query.populate(populate);
    const [items, total] = await Promise.all([query, model.countDocuments()]);
    return { items, pagination: { ...options, total, pages: Math.ceil(total / options.limit) } };
};

export const dashboard = async (req, res, next) => {
    try {
        const today = new Date(); today.setUTCHours(0, 0, 0, 0);
        const [users, jobs, companies, applications, scrapedToday, rawTopSkills, topCompanies, topLocations] = await Promise.all([
            count(User), count(Job), count(Company), count(Application), count(Job, { createdAt: { $gte: today }, $or: [{ isAggregated: true }, { source: { $exists: true, $ne: '' } }] }),
            Job.aggregate([{ $unwind: '$skills' }, { $group: { _id: '$skills', count: { $sum: 1 } } }]),
            Job.aggregate([{ $group: { _id: '$company', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 }, { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'company' } }, { $unwind: { path: '$company', preserveNullAndEmptyArrays: true } }, { $project: { _id: 0, name: '$company.name', count: 1 } }]),
            Job.aggregate([{ $group: { _id: '$location', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 }])
        ]);
        const topSkills = Object.values(rawTopSkills.reduce((totals, item) => {
            const name = normalizeSkill(item._id);
            if (!name) return totals;
            totals[name] = { _id: name, count: (totals[name]?.count || 0) + item.count };
            return totals;
        }, {})).sort((a, b) => b.count - a.count || a._id.localeCompare(b._id)).slice(0, 8);
        res.json({ success: true, statistics: { totalUsers: users, totalJobs: jobs, totalCompanies: companies, totalApplications: applications, jobsScrapedToday: scrapedToday, topSkills, topCompanies, topLocations } });
    } catch (error) { next(error); }
};
export const users = async (req, res, next) => { try { const options = pageOptions(req, res); if (!options) return; const result = await list(User, options, null, true); res.json({ success: true, users: result.items, pagination: result.pagination }); } catch (error) { next(error); } };
export const jobs = async (req, res, next) => { try { const options = pageOptions(req, res); if (!options) return; const result = await list(Job, options, 'company created_by'); res.json({ success: true, jobs: result.items.map(withNormalizedSkills), pagination: result.pagination }); } catch (error) { next(error); } };
export const companies = async (req, res, next) => { try { const options = pageOptions(req, res); if (!options) return; const result = await list(Company, options, 'userId'); res.json({ success: true, companies: result.items, pagination: result.pagination }); } catch (error) { next(error); } };
