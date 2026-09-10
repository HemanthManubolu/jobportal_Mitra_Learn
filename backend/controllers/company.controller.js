import mongoose from "mongoose";
import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

const uploadLogo = async (file) => {
    if (!file) return null;
    if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) { const error = new Error("File upload is not configured."); error.status = 503; throw error; }
    return cloudinary.uploader.upload(getDataUri(file).content, { resource_type: 'image' });
};
export const registerCompany = async (req, res, next) => { try {
    const { companyName } = req.body; if (!companyName?.trim()) return res.status(400).json({ message: "Company name is required.", success: false });
    if (await Company.exists({ name: companyName.trim() })) return res.status(409).json({ message: "A company with this name already exists.", success: false });
    const company = await Company.create({ name: companyName.trim(), userId: req.id }); res.status(201).json({ message: "Company registered successfully.", company, success: true });
} catch (error) { next(error); } };
export const getCompany = async (req, res, next) => { try { const companies = await Company.find({ userId: req.id }); res.json({ companies, success: true }); } catch (error) { next(error); } };
export const getCompanyById = async (req, res, next) => { try { if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid company id." }); const company = await Company.findOne({ _id: req.params.id, userId: req.id }); if (!company) return res.status(404).json({ message: "Company not found or not owned by you.", success: false }); res.json({ company, success: true }); } catch (error) { next(error); } };
export const updateCompany = async (req, res, next) => { try {
    const company = await Company.findOne({ _id: req.params.id, userId: req.id }); if (!company) return res.status(404).json({ message: "Company not found or not owned by you.", success: false });
    const { name, description, website, location } = req.body; if (name && name !== company.name && await Company.exists({ name })) return res.status(409).json({ success: false, message: "A company with this name already exists." });
    if (name) company.name = name; if (description !== undefined) company.description = description; if (website !== undefined) company.website = website; if (location !== undefined) company.location = location;
    const upload = await uploadLogo(req.file); if (upload) company.logo = upload.secure_url; await company.save(); res.json({ message: "Company information updated.", company, success: true });
} catch (error) { next(error); } };
