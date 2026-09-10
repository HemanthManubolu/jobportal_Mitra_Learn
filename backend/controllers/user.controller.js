import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

const publicUser = (user) => ({ _id: user._id, fullname: user.fullname, email: user.email, phoneNumber: user.phoneNumber, role: user.role, profile: user.profile });
const uploadFile = async (file) => {
    if (!file) return null;
    if (!process.env.CLOUD_NAME || !process.env.API_KEY || !process.env.API_SECRET) {
        const error = new Error("File upload is not configured. Add Cloudinary environment variables."); error.status = 503; throw error;
    }
    return cloudinary.uploader.upload(getDataUri(file).content, { resource_type: "auto" });
};
const emailIsValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const phoneIsValid = (phone) => /^\+?[0-9\s()-]{7,20}$/.test(String(phone));

export const register = async (req, res, next) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;
        if (!fullname || !email || !phoneNumber || !password || !role) return res.status(400).json({ message: "Full name, email, phone, password and role are required.", success: false });
        if (!emailIsValid(email) || !phoneIsValid(phoneNumber)) return res.status(400).json({ message: "Provide a valid email address and phone number.", success: false });
        if (req.file && !req.file.mimetype.startsWith('image/')) return res.status(400).json({ success: false, message: 'Profile photo must be an image.' });
        if (!['candidate', 'employer'].includes(role)) return res.status(403).json({ message: "Only candidate and employer accounts can be created publicly.", success: false });
        if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters.", success: false });
        if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: "An account already exists with this email.", success: false });
        const upload = await uploadFile(req.file);
        await User.create({ fullname: fullname.trim(), email: email.toLowerCase(), phoneNumber, password: await bcrypt.hash(password, 12), role, profile: { profilePhoto: upload?.secure_url || "" } });
        res.status(201).json({ message: "Account created successfully.", success: true });
    } catch (error) { next(error); }
};

export const login = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;
        if (!email || !password || !emailIsValid(email)) return res.status(400).json({ message: "A valid email and password are required.", success: false });
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Incorrect email or password.", success: false });
        if (role && role !== user.role) return res.status(403).json({ message: "Account does not match the selected role.", success: false });
        const token = jwt.sign({ userId: user._id, role: user.role }, process.env.SECRET_KEY, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
        const production = process.env.NODE_ENV === 'production';
        res.status(200).cookie("token", token, { maxAge: 86400000, httpOnly: true, secure: production, sameSite: production ? 'none' : 'lax' }).json({ message: `Welcome back ${user.fullname}`, user: publicUser(user), token, success: true });
    } catch (error) { next(error); }
};

export const logout = (req, res) => {
    const production = process.env.NODE_ENV === 'production';
    return res.status(200).clearCookie("token", { httpOnly: true, secure: production, sameSite: production ? 'none' : 'lax' }).json({ message: "Logged out successfully.", success: true });
};
export const updateProfile = async (req, res, next) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        const user = await User.findById(req.id);
        if (!user) return res.status(404).json({ message: "User not found.", success: false });
        if (email && email.toLowerCase() !== user.email && await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: "An account already exists with this email.", success: false });
        if (email && !emailIsValid(email)) return res.status(400).json({ success: false, message: 'Provide a valid email address.' });
        if (phoneNumber && !phoneIsValid(phoneNumber)) return res.status(400).json({ success: false, message: 'Provide a valid phone number.' });
        if (req.file && req.file.mimetype !== 'application/pdf') return res.status(400).json({ success: false, message: 'Resume must be a PDF.' });
        if (fullname) user.fullname = fullname.trim(); if (email) user.email = email.toLowerCase(); if (phoneNumber) user.phoneNumber = phoneNumber;
        if (bio !== undefined) user.profile.bio = bio;
        if (skills !== undefined) user.profile.skills = Array.isArray(skills) ? skills : skills.split(',').map((skill) => skill.trim()).filter(Boolean);
        const upload = await uploadFile(req.file);
        if (upload) { user.profile.resume = upload.secure_url; user.profile.resumeOriginalName = req.file.originalname; }
        await user.save(); res.json({ message: "Profile updated successfully.", user: publicUser(user), success: true });
    } catch (error) { next(error); }
};
export const getMe = async (req, res, next) => { try { const user = await User.findById(req.id); if (!user) return res.status(404).json({ success: false, message: "User not found." }); res.json({ success: true, user: publicUser(user) }); } catch (error) { next(error); } };
