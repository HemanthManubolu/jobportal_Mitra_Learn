import { importRemotiveJobs, importSelectedRemotiveJobs, previewRemotiveJobs } from "../services/remotiveScraper.js";
export const scrapeJobs = async (req, res, next) => { try { const result = await importRemotiveJobs(req.id); res.json({ success: true, ...result }); } catch (error) { next(error); } };
export const previewJobs = async (req, res) => {
    try { const result = await previewRemotiveJobs(); res.json({ success: true, fetched: result.jobs.length, ...result }); }
    catch (error) { res.status(502).json({ success: false, message: 'Remotive is currently unavailable. No jobs were saved; please try again later.', detail: error.message }); }
};
export const importSelectedJobs = async (req, res, next) => {
    try {
        if (!Array.isArray(req.body?.jobs)) return res.status(400).json({ success: false, message: 'jobs must be an array of selected preview jobs.', added: 0, duplicates: 0, errors: 1, errorDetails: [{ message: 'jobs must be an array.' }] });
        if (req.body.jobs.length === 0) return res.status(400).json({ success: false, message: 'Select at least one job to import.', added: 0, duplicates: 0, errors: 1, errorDetails: [{ message: 'No jobs were selected.' }] });
        if (req.body.jobs.length > 250) return res.status(400).json({ success: false, message: 'A maximum of 250 jobs can be imported at once.', added: 0, duplicates: 0, errors: 1, errorDetails: [{ message: 'Too many selected jobs.' }] });
        const result = await importSelectedRemotiveJobs(req.id, req.body.jobs);
        res.json({ success: true, ...result });
    } catch (error) { next(error); }
};
