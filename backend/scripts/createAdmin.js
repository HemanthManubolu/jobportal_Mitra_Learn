import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model.js';
dotenv.config();
import dns from "dns";

dns.setServers([
    "1.1.1.1",
    "8.8.8.8"
]);
const required = ['MONGO_URI', 'ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_PHONE', 'ADMIN_PASSWORD'];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
await mongoose.connect(process.env.MONGO_URI);
const email = process.env.ADMIN_EMAIL.toLowerCase();
if (await User.exists({ email })) throw new Error('An account already exists with ADMIN_EMAIL. Update its role through a controlled database operation instead.');
await User.create({ fullname: process.env.ADMIN_NAME, email, phoneNumber: process.env.ADMIN_PHONE, password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 12), role: 'admin' });
console.log(`Admin account created for ${email}.`);
await mongoose.disconnect();
